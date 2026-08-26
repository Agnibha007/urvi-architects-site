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
      duration: isMobile ? 0.6 : 0.85,
      // Very soft ease-out — barely there, just enough to smooth the edges.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)),
      smoothWheel: !isMobile,
      syncTouch: true,
      syncTouchLerp: isMobile ? 0.18 : 0.15,
      touchInertiaMultiplier: isMobile ? 7 : 10,
      wheelMultiplier: isMobile ? 1.3 : 1.0,
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
