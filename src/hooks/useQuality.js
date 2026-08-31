import { useRef } from 'react'

/**
 * Device quality tier — 'high' | 'medium' | 'low'.
 *
 * Drives geometry LOD, particle count and shader detail without touching the
 * creative direction. 'high' = dedicated GPU (desktop), 'medium' = integrated
 * GPU / laptop, 'low' = mobile or reduced-motion.
 *
 * `qualityRef` is a module-level mutable reference so non-React modules (the
 * master timeline) can read the tier without a component re-render. The hook
 * just guarantees it is initialised on the client.
 */
let _q = 'high'
function pickQuality(win) {
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  const na = win.navigator
  const cores = na.hardwareConcurrency ?? 8
  const mem = na.deviceMemory ?? 8
  const mobile = /Mobi|Android|iPhone|iPad/i.test(na.userAgent) || win.innerWidth < 768
  if (mobile) return 'low'
  if (cores < 4 || mem < 4) return 'medium'
  return 'high'
}

export const qualityRef = { current: _q }

export function useQuality() {
  const quality = useRef(
    typeof window !== 'undefined' ? pickQuality(window) : 'high'
  )
  if (typeof window !== 'undefined') qualityRef.current = quality.current
  return quality
}
