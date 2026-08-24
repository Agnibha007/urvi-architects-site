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
      duration: isMobile ? 0.6 : 0.8,
      // Gentle ease-out — light and responsive, no heavy tail.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      smoothWheel: !isMobile,
      syncTouch: true,
      syncTouchLerp: isMobile ? 0.15 : 0.12,
      touchInertiaMultiplier: isMobile ? 10 : 14,
      wheelMultiplier: isMobile ? 1.2 : 1.0,
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
