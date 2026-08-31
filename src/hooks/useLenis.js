import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Binds Lenis to GSAP's single RAF loop so scroll, ScrollTrigger and the
 * R3F canvas all advance on the same frame. Two RAF loops = two truths = jank.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const isMobile = window.innerWidth < 768
    const lenis = new Lenis({
      // Shorter duration = more immediate scroll response. The scroll
      // should feel like pushing paper, not swimming through honey.
      duration: isMobile ? 0.35 : 0.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      smoothWheel: !isMobile,
      syncTouch: true,
      syncTouchLerp: isMobile ? 0.12 : 0.10,
      touchInertiaMultiplier: isMobile ? 5 : 7,
      wheelMultiplier: isMobile ? 1.2 : 1.1,
      lerp: null,
    })

    window.__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}
