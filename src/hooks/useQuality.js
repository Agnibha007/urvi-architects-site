import { useRef } from 'react'

/**
 * Device quality tier — 'high' | 'medium' | 'low'.
 *
 * Drives geometry LOD, particle count and shader detail without touching the
 * creative direction. 'high' = dedicated GPU (desktop), 'medium' = integrated
 * GPU / laptop, 'low' = mobile or reduced-motion.
 *
 * Purely a heuristics table; the value is a mutable ref so consumers read
 * `.current` inside useFrame / render without causing re-renders.
 */
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

export function useQuality() {
  const quality = useRef(
    typeof window !== 'undefined' ? pickQuality(window) : 'high'
  )
  return quality
}
