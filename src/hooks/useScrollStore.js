import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'

/**
 * A mutable, render-free store describing where the reader is in the film.
 * The R3F scene and the DOM sections both read from this, which is how the
 * 3D layer stays synchronised with the video timeline without prop-drilling
 * or re-rendering anything.
 */
export const scrollStore = {
  /** 0..1 across the entire document */
  global: 0,
  /** 0..1 within the currently active section */
  local: 0,
  /** section id, e.g. 'kitchen' */
  section: 'hero',
  /** signed scroll velocity, normalised-ish */
  velocity: 0,
  /** 0 = light world, 1 = dark world. Drives 3D lighting + material tint. */
  darkness: 0,
}

export function useScrollStore() {
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        scrollStore.global = self.progress
        scrollStore.velocity = self.getVelocity() / 3000
      },
    })
    return () => st.kill()
  }, [])
}

/** Called by each section's ScrollTrigger as it becomes active. */
export function reportSection(id, progress, darkness = 0) {
  scrollStore.section = id
  scrollStore.local = progress
  scrollStore.darkness = darkness
}
