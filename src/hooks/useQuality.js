import { useRef } from 'react'
import { deviceTier } from '@/lib/deviceTier'

/**
 * Device quality tier — 'high' | 'medium' | 'low'.
 *
 * Thin React wrapper over the zero-dependency `deviceTier` module. Drives
 * geometry LOD, particle count, shader detail and video preload budget without
 * touching the creative direction: 'high' = dedicated GPU (desktop),
 * 'medium' = integrated GPU / laptop, 'low' = mobile or reduced-motion.
 *
 * Returns a stable mutable ref so consumers read `.current` inside useFrame /
 * render without causing re-renders.
 */
export function useQuality() {
  return useRef(deviceTier.current)
}
