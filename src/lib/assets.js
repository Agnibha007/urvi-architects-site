// Single source of truth for every media asset.
// Vite serves /public verbatim, so these are stable absolute URLs — no import churn,
// no bundling of 20MB of video into the JS graph.

/**
 * Two renditions ship, both 24fps (the source rate — no synthetic frames):
 *   hd/  1920×1080, CRF 16, lanczos + light unsharp, every frame a keyframe
 *   sd/  1280×720   CRF 16, native resolution,       every frame a keyframe
 *
 * Desktop gets hd so the full-bleed plates stay sharp on high-DPI panels;
 * everything else gets sd, so the story is never gated behind a 157MB download.
 *
 * ALL-KEYFRAME ENCODING IS THE WHOLE TRICK. With a normal GOP, setting
 * currentTime to an arbitrary value forces the decoder back to the previous
 * I-frame and re-decodes forward — that latency is exactly the stutter people
 * mean when they say scrubbed video feels broken. At -g 1 every frame is
 * independently decodable, so a seek is O(1) and scrubbing is frame-exact.
 * It costs ~3× the bitrate, and it is the correct trade for this build.
 */
function pickTier() {
  if (typeof window === 'undefined') return 'hd'

  const nav = navigator
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection

  if (conn?.saveData) return 'sd'
  if (conn?.effectiveType && !/4g/.test(conn.effectiveType)) return 'sd'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'sd'
  if (window.innerWidth < 900) return 'sd'
  if ((nav.deviceMemory ?? 8) < 4) return 'sd'
  if ((nav.hardwareConcurrency ?? 8) < 4) return 'sd'

  return 'hd'
}

export const TIER = pickTier()
export const VIDEO_FPS = 24

const v = (name) => `/assets/videos/${TIER}/${name}.mp4`

export const VIDEOS = {
  heroChair: v('hero-chair'),
  livingTable: v('living-table'),
  kitchenIsland: v('kitchen-island'),
  bedroomBed: v('bedroom-bed'),
  pendantLight: v('pendant-light'),
  blueprintVilla: v('blueprint-villa'),
  villaAssembly: v('villa-assembly'),
}

export const IMAGES = {
  loungeChair: '/assets/images/lounge-chair.jpg',
  coffeeTable: '/assets/images/coffee-table.jpg',
  kitchenIsland: '/assets/images/kitchen-island.jpg',
  kingBed: '/assets/images/king-bed.jpg',
  floorLamp: '/assets/images/floor-lamp.jpg',
  brassFaucet: '/assets/images/brass-faucet.jpg',
  sculpture: '/assets/images/sculpture.jpg',
  oliveTree: '/assets/images/olive-tree.jpg',
  villaModel: '/assets/images/villa-model.jpg',
  blueprint: '/assets/images/blueprint.jpg',
  materialCube: '/assets/images/material-cube.jpg',
}

// Playback order — the finale preloads nothing until the blueprint is on screen.
export const PRELOAD_FIRST = VIDEOS.heroChair

export const MATERIALS = [
  { name: 'Travertine', origin: 'Tivoli, Lazio', hex: '#D8CEC0', note: 'Porous. Sun-warmed. Quietly imperfect.' },
  { name: 'Walnut', origin: 'Piedmont', hex: '#6B4A31', note: 'Grain read as a drawing, not a surface.' },
  { name: 'Concrete', origin: 'Cast in place', hex: '#9C9891', note: 'Board-formed. It remembers the mould.' },
  { name: 'Marble', origin: 'Carrara', hex: '#EDEAE4', note: 'Veining chosen slab by slab.' },
  { name: 'Brass', origin: 'Unlacquered', hex: '#A98D67', note: 'Left to patina by the hands that use it.' },
  { name: 'Glass', origin: 'Low-iron', hex: '#C6CFCE', note: 'Edge-polished. Almost not there.' },
]
