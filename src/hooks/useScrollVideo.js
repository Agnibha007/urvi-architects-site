import { useEffect, useRef } from 'react'
import { registerVideo, unregisterVideo } from '@/lib/masterTimeline'

/**
 * Scroll-scrubbed video — a PURE RENDERER of the canonical master timeline.
 *
 * This hook does NOT own the page timeline. It never creates a ScrollTrigger
 * and never blocks or advances scroll. It registers with the master timeline,
 * which feeds it `desiredLocal` (0..1 section progress derived purely from the
 * page's scroll position). The page keeps moving regardless of whether this
 * video has caught up.
 *
 * Two concerns are kept strictly separate:
 *   desiredFrame   — what the page wants (updates every scroll tick)
 *   displayedFrame — what the decoder has actually shown
 *   readiness      — how far decoding has progressed (idle → ready)
 *
 * SEEK = newest-frame-wins. Only the latest desired frame is ever told to the
 * decoder. If a seek is in flight, the newest target is stashed as `pending`
 * and applied the instant the current seek resolves — intermediate frames are
 * never replayed. Generation tokens discard stale decoder callbacks so a late
 * `seeked`/RVFC from an old frame can never corrupt the current section.
 */

export function useScrollVideo({ src, fps = 24, sectionId, range = [0, 1] }) {
  const videoRef = useRef(null)
  const stateRef = useRef({
    desiredLocal: 0,
    applied: -1,
    pendingFrame: null,
    seeking: false,
    generation: 0,
    issuedGen: 0,
    primed: false,
    priority: 0,
    warmed: false,
    readiness: 'idle', // idle | loading | metadata-ready | warming | ready
    attached: false,
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const s = stateRef.current
    const frame = 1 / fps
    const [rIn, rOut] = range
    const span = Math.max(rOut - rIn, 0.0001)

    const setReadiness = (level) => { s.readiness = level }

    // Development-only instrumentation, stripped from production builds.
    // eslint-disable-next-line no-unused-vars
    const trace = (msg, extra = {}) => {
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.__URVI_TRACE__) {
        console.log(`[vid:${sectionId}] ${msg}`, {
          priority: s.priority,
          attached: s.attached,
          readiness: s.readiness,
          primed: s.primed,
          desiredFrame: s.applied,
          gen: s.generation,
          ...extra,
        })
      }
    }

    // Prime the decoder so arbitrary seeks actually present a frame. On
    // Safari/iOS a video that has never been play()'d ignores currentTime —
    // muted+playsInline lets play() succeed without a gesture, then we pause.
    // Guarded so it runs once (only until 'ready'), not every scroll tick.
    const prime = () => {
      if (s.primed) return
      const p = video.play()
      if (p && typeof p.then === 'function') {
        p.then(() => { s.primed = true; video.pause() }).catch(() => { s.primed = true })
      } else {
        s.primed = true
        video.pause()
      }
    }

    const seekTo = (t) => {
      s.generation++
      s.applied = t
      s.seeking = true
      s.issuedGen = s.generation
      video.currentTime = t
    }

    // When a seek resolves, apply the newest pending frame immediately. The
    // generation token discards stale callbacks (e.g. a warm-up seek from a
    // previous section that resolves late — it must not clobber current state).
    const finishSeek = (capturedGen, _mediaTime) => {
      if (capturedGen !== s.generation) return // stale — drop entirely
      s.seeking = false
      if (s.pendingFrame !== null) {
        const t = s.pendingFrame
        s.pendingFrame = null
        seekTo(t) // bumps generation again; the next seeked must match it
      }
    }

    const onLoadedMetadata = () => {
      setReadiness('metadata-ready')
      // Warm: prime the decoder and seek to this video's first slice frame so
      // a decoded frame already exists before the section becomes active.
      prime()
      const startT = Math.min(Math.max(0, rIn * video.duration), video.duration - frame)
      seekTo(startT)
      setReadiness('warming')
      trace('metadata-ready + primed', { warmedTo: startT })
    }
    const onCanPlay = () => { if (s.readiness !== 'ready') setReadiness('ready') }
    // 'seeked' corresponds to the seek that incremented issuedGen. Compare
    // against the CURRENT generation so a late seeked from an overwritten seek
    // or a previous section is dropped.
    const onSeeked = (_e2) => finishSeek(s.issuedGen)

    /* ---------- render tick: catch video up to canonical state ---------- */

    // The loop runs only while a video is attached (priority-driven). It is
    // started on attach and stops when the video is unloaded, saving RAF
    // budget for distant sections. Declared HERE (before attachSrc) because
    // attachSrc's eager path runs synchronously during the effect body, so all
    // referenced consts must already be initialised (no TDZ).
    let rafId = 0
    const tick = () => {
      if (!s.attached) return // keep sleeping until re-attached
      if (s.readiness !== 'ready' && s.readiness !== 'warming') {
        rafId = requestAnimationFrame(tick)
        return
      }
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) { rafId = requestAnimationFrame(tick); return }

      // desired frame is a pure function of section scroll progress.
      const local = Math.min(1, Math.max(0, (s.desiredLocal - rIn) / span))
      const wantT = Math.min(duration - frame, Math.round(local * duration / frame) * frame)

      if (!s.seeking) {
        if (Math.abs(wantT - s.applied) >= frame * 0.5) seekTo(wantT)
      } else {
        // seek in flight — hold the newest target for when it resolves
        if (s.pendingFrame === null || Math.abs(wantT - s.pendingFrame) >= frame * 0.5) {
          s.pendingFrame = wantT
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    const startTicking = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(tick)
    }

    /* ---------- priority-driven lifecycle (predictive preload) ---------- */

    // Attach src eagerly for above-the-fold (hero). Others attach lazily via
    // setPriority when they become the predicted next section.
    const attachSrc = () => {
      if (s.attached) return
      s.attached = true
      video.src = src
      video.load()
      // Restart the render loop (it stops while unloaded to save RAF budget).
      startTicking()
    }

    // Release the decoder's memory. Bump the generation so no stale seek /
    // RVFC from this decoder can corrupt a future section, then pause and drop
    // the source. `load()` re-enters the empty state and frees buffers; the
    // element still re-arms cleanly for a later attachSrc.
    const unload = () => {
      if (!s.attached) return
      s.generation++ // invalidate any in-flight/stale decoder callbacks
      s.issuedGen = s.generation
      s.seeking = false
      s.pendingFrame = null
      s.applied = -1
      s.primed = false
      s.readiness = 'idle'
      s.attached = false
      s.warmed = false
      try { video.pause() } catch (_e) { /* noop */ }
      try {
        video.removeAttribute('src')
        video.load() // release the old resource; safe to call on the empty element
      } catch (_e) { /* noop */ }
    }

    // Called by driveMaster only when the resident priority CHANGES (the master
    // dedupes identical transitions) — never on every scroll tick. This is the
    // single mechanism that alters a video's loading state.
    const setPriority = (priority, isActive, warmNow) => {
      // (Re)prime when the section crosses the aggressive-warm drain (0.80).
      // prime() is idempotent — it runs at most once per attach/reset — so this
      // never yields repeated play()/pause() calls. It's a genuine retry for
      // the fast-scroll case where the initial preload prime came too early.
      if (warmNow) prime()
      s.priority = priority
      if (priority >= 2) {
        // Predicted next / active: attach src (idempotent) + warm the decoder.
        attachSrc()
        prime()
        trace('preload/warm', { priority, warmNow })
      } else if (priority === 0) {
        // Distant: release memory (hysteresis is enforced by the master's
        // distance window, so this won't thrash on a tiny progress dip).
        unload()
        trace('unload')
      } else {
        trace('available', { priority })
      }
      // priority === 1: keep whatever we have; never load a fresh src.
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('seeked', onSeeked)

    // Eager (hero) mount: attach immediately; otherwise register idle and let
    // the priority system pull src in as the user approaches.
    const eager = video.dataset.eager !== undefined
    if (eager) attachSrc()

    registerVideo(sectionId, {
      video,
      range,
      fps,
      // Pass the SHARED mutable state object so masterTimeline writes
      // desiredLocal directly into the same object the tick reads.
      state: s,
      setPriority,
    })

    if (s.attached) startTicking()

    return () => {
      cancelAnimationFrame(rafId)
      unregisterVideo(sectionId, video)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('seeked', onSeeked)
      s.applied = -1
      s.pendingFrame = null
      s.seeking = false
      s.generation++
      s.issuedGen = 0
      s.primed = false
      s.readiness = 'idle'
      s.priority = 0
      s.attached = false
      s.warmed = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fps, sectionId])

  return videoRef
}
