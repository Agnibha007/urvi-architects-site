import { deviceTier } from '@/lib/deviceTier'

/**
 * CANONICAL MASTER TIMELINE
 *
 * The page's scroll position is the single source of truth. Sections register
 * their videos here (id → array of {videoRef, range, fps}). A single update
 * pass, driven by the master scroll progress, computes the DESIRED frame for
 * every video. Videos never drive scroll — they are pure renderers of this
 * canonical state.
 *
 * Three distinct notions are kept apart:
 *   desiredFrame  — what the page wants (updated every scroll tick)
 *   displayedFrame— what the decoder last presented
 *   readiness     — how far the decoder has progressed (idle → ready)
 */

/* Section definitions in document order, with their scroll weight (Chapter length).
 * The weights generate the master ranges so a video maps 1:1 with its section. */
export const SECTIONS = [
  { id: 'hero', weight: 1.8 },
  { id: 'living', weight: 1.5 },
  { id: 'kitchen', weight: 3.0 },
  { id: 'bedroom', weight: 1.8 },
  { id: 'materials', weight: 2.0 },
  { id: 'blueprint', weight: 1.8 },
  { id: 'finale', weight: 1.9 },
  { id: 'contact', weight: 0.4 },
]

// Precomputed master [start,end) for each section, 0..1.
export const SECTION_RANGES = (() => {
  const sum = SECTIONS.reduce((a, s) => a + s.weight, 0)
  let acc = 0
  const ranges = {}
  for (const s of SECTIONS) {
    ranges[s.id] = [acc / sum, (acc + s.weight) / sum]
    acc += s.weight
  }
  return ranges
})()

// Ordered id list + master-range lookup.
export const SECTION_IDS = SECTIONS.map((s) => s.id)
export function sectionRange(id) {
  return SECTION_RANGES[id] || [0, 1]
}

/* A video of section `id` — maps section progress [rangeIn,rangeOut] onto its
 * own timestamps. Registered per ScrollVideo instance.
 *
 * `state` must be the SAME mutable object the video's render tick reads; the
 * master writes desiredLocal into it directly so the tick always sees the
 * latest canonical target with zero copying. */
const registry = new Map() // id -> [ {video, range, fps, state, setPriority}, ... ]

export function registerVideo(id, entry) {
  if (!registry.has(id)) registry.set(id, [])
  registry.get(id).push(entry)
}

export function unregisterVideo(id, video) {
  const arr = registry.get(id)
  if (arr) {
    const i = arr.findIndex((e) => e.video === video)
    if (i !== -1) arr.splice(i, 1)
  }
}

/**
 * Return the local 0..1 progress of a section given master 0..1 progress.
 * Clamped: returns 0 before a section starts and 1 after it ends.
 */
export function getSectionProgress(id, master) {
  const [start, end] = sectionRange(id)
  if (master <= start) return 0
  if (master >= end) return 1
  return (master - start) / (end - start)
}

/** Which section owns a given master progress. */
export function getActiveSection(master) {
  for (const id of SECTION_IDS) {
    const [s, e] = sectionRange(id)
    if (master >= s && master < e) return id
  }
  return SECTION_IDS[SECTION_IDS.length - 1]
}

/* ---- predictive preload / unload policy -------------------------------- */

// Section-local progress at which the predicted next video is (a) attached &
// loaded and (b) aggressively warmed. These are tuned against the section
// weights above (e.g. living 1.5, kitchen 3.0) so that by the time the next
// section is entered its decoder is already warm.
//
// Preload happens as the ACTIVE section drains toward the boundary of travel
// (forward: local -> 1; reverse: local -> 0, mirrored). A single drain measure
// reaches PRELOAD_AT to attach+load, and WARM_AT to fire the aggressive
// decoder warm. Both map to priority 2 (setPriority); WARM_AT additionally
// retries prime() if the earlier attach-time prime was too early.
export const PRELOAD_AT = 0.6
export const WARM_AT = 0.8

// How many section-steps a non-adjacent section must be away before we unload
// it. This IS the hysteresis: entering/leaving the unload set requires moving
// >=2 sections, so tiny progress oscillations can never thrash load/unload.
const UNLOAD_DISTANCE = 2
// Low/mobile tiers keep a tighter window to hold fewer decoded HD videos.
const UNLOAD_DISTANCE_LOW = 1

/**
 * Decide the priority of every section for the current canonical state.
 *
 * Priority model (per video, via its setPriority):
 *   0 = distant → unload
 *   1 = available → keep warm if loaded, never load
 *   2 = predicted next → preload (attach + warm decoder)
 *   3 = active → active seek target
 *
 * `predictedId` is the section we will land on next given travel direction,
 * so large jumps still promote the true destination (see driveMaster).
 */
export function computePriorities(activeId, activeLocal, velocity, predictedId) {
  const idx = SECTION_IDS.indexOf(activeId)
  const movingForward = velocity >= 0
  const walk = movingForward ? 1 : -1
  const prevIdx = movingForward ? idx - 1 : idx + 1
  const out = new Map() // id -> priority

  for (let j = 0; j < SECTION_IDS.length; j++) {
    const id = SECTION_IDS[j]
    let p
    if (id === activeId) {
      p = 3
    } else if (id === predictedId) {
      // Predicted destination — promoted as the active section drains toward
      // the boundary it's moving toward. Forward: activeLocal rises to 1.
      // Reverse: activeLocal falls to 0 (mirror). Either way a single drain
      // measure >= PRELOAD_AT attaches + warms the destination ahead of time.
      const drain = movingForward ? activeLocal : 1 - activeLocal
      p = drain >= PRELOAD_AT ? 2 : 1
    } else if (j === prevIdx) {
      // Opposite neighbour — keep available for common reverse scrolling.
      p = 1
    } else {
      // Distant — unload past a hysteresis distance.
      const dist = Math.abs(j - idx)
      const max = deviceTier.current === 'high' ? UNLOAD_DISTANCE : UNLOAD_DISTANCE_LOW
      p = dist <= max ? 1 : 0
    }
    out.set(id, p)
  }
  return out
}

/* ---- the single write loop --------------------------------------------- */

let master = 0
let active = 'hero'
export const masterState = { progress: 0, velocity: 0 }

/** Set the canonical master progress; updates every registered video's desired frame. */
export function driveMaster(progress, velocity) {
  master = progress
  masterState.progress = progress
  masterState.velocity = velocity
  active = getActiveSection(progress)
  const activeLocal = getSectionProgress(active, progress)
  const idx = SECTION_IDS.indexOf(active)
  const movingForward = velocity >= 0
  const predictedId = movingForward
    ? (idx < SECTION_IDS.length - 1 ? SECTION_IDS[idx + 1] : null)
    : (idx > 0 ? SECTION_IDS[idx - 1] : null)
  // "Drain" of the active section toward the boundary we're moving to.
  const drain = movingForward ? activeLocal : 1 - activeLocal

  const priorities = computePriorities(active, activeLocal, velocity, predictedId)

  for (const id of registry.keys()) {
    const local = getSectionProgress(id, progress)
    const entries = registry.get(id)
    const priority = priorities.get(id) ?? 0
    const isActive = id === active
    const isPredicted = id === predictedId
    const warmNow = isPredicted && drain >= WARM_AT
    for (const e of entries) {
      // Desired frame is a pure function of scroll — never of decode state.
      // Write into the video's own mutable state (shared reference) so its
      // tick reads the freshest canonical target.
      e.state.desiredLocal = local
      // Warm-retry de-dup: fire setPriority when (a) priority changes, or
      // (b) the predicted section crosses the "aggressively warm" drain that a
      // simple preload hadn't reached. Idempotent prime() inside makes repeat
      // play() calls impossible. `warmed` lives in the video's state so unload
      // clears it for re-warming later.
      const warmed = e.state.warmed === true
      const warmCrossed = warmNow && !warmed
      if (e.priority !== priority || warmCrossed) {
        if (warmNow) e.state.warmed = true
        e.priority = priority
        // Single mechanism that changes a video's load/priority state.
        e.setPriority?.(priority, isActive, warmNow)
      }
    }
  }
}
