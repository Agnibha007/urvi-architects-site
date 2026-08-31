import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { driveMaster } from '@/lib/masterTimeline'

/**
 * A mutable, render-free store describing where the reader is in the film.
 * The R3F scene and the DOM sections both read from this, which is how the
 * 3D layer stays synchronised with the video timeline without prop-drilling
 * or re-rendering anything.
 *
 * This is also the authoritative scroll feed for the master timeline: every
 * ScrollTrigger update drives the canonical video state (and predictive
 * preload) — videos never decide page state, the page decides their state.
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
    // Bootstrap: establish the canonical state from the very first frame so
    // the hero video's priority/preload is resolved before the first scroll.
    driveMaster(0, 0)

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        scrollStore.global = self.progress
        scrollStore.velocity = self.getVelocity() / 3000
        // The canonical master progress feeds every video's desired frame.
        driveMaster(self.progress, self.getVelocity() / 3000)
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
