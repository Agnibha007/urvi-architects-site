/**
 * Device quality tier — 'high' | 'medium' | 'low'.
 *
 * A zero-dependency module (no React, no Three, no app imports) so the master
 * timeline and the R3F scene can both read the tier without creating a
 * circular import graph that would corrupt Three.js module initialisation
 * order in the production bundle.
 *
 * Values are resolved once against window heuristics; consumers read
 * `deviceTier.current` inside useFrame / render / scroll to avoid re-renders.
 */
let _q = 'high'

function pickQuality() {
  const win = typeof window !== 'undefined' ? window : null
  if (!win) return 'high'
  if (win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  const na = win.navigator
  const cores = na.hardwareConcurrency ?? 8
  const mem = na.deviceMemory ?? 8
  const mobile = /Mobi|Android|iPhone|iPad/i.test(na.userAgent) || win.innerWidth < 768
  if (mobile) return 'low'
  if (cores < 4 || mem < 4) return 'medium'
  return 'high'
}

export const deviceTier = { current: _q }

// Resolve (and memoise) on first import in the browser.
if (typeof window !== 'undefined') deviceTier.current = pickQuality()
