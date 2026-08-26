import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Luxury timing — Apple keynote easing curve, registered once globally.
gsap.registerEase('apple', (p) => 1 - Math.pow(1 - p, 4))
gsap.registerEase('silk', (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2))

gsap.defaults({ ease: 'apple', duration: 2.0 })

// ScrollTrigger reads layout once per resize instead of per-scroll.
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true })

export { gsap, ScrollTrigger }
