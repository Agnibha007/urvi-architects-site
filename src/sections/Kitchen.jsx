import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import { VIDEOS, IMAGES } from '@/lib/assets'

const SPECS = [
  ['Slab', 'Calacatta Viola, bookmatched'],
  ['Span', '3.6 m, single piece'],
  ['Edge', '20 mm mitred, hand-eased'],
  ['Fittings', 'Unlacquered brass'],
]

/**
 * KITCHEN — the island.
 *
 * The island is lifted off the page: a soft contact shadow underneath, a
 * perspective tilt that eases toward flat as you scroll, and a scale that
 * exceeds the frame. It should read as an object photographed on a plinth,
 * floating over the type rather than sitting behind it.
 */
export default function Kitchen() {
  const root = useRef(null)
  const plate = useRef(null)
  const shadow = useRef(null)
  const heading = useRef(null)
  const specs = useRef(null)
  const faucet = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.2}`,
          scrub: 1.15,
          invalidateOnRefresh: true,
        },
      })

      // Camera zoom + the tilt settling.
      tl.fromTo(
        plate.current,
        { scale: 1.02, rotateX: 9, rotateY: -7, yPercent: 5 },
        { scale: 1.22, rotateX: 0, rotateY: 3, yPercent: -5, ease: 'none' },
        0
      )

      // Contact shadow tightens as the object "settles".
      tl.fromTo(
        shadow.current,
        { opacity: 0.1, scaleX: 1.25, filter: 'blur(60px)' },
        { opacity: 0.26, scaleX: 0.86, filter: 'blur(34px)', ease: 'none' },
        0
      )

      // Heading clips in from the left.
      tl.fromTo(
        heading.current,
        { clipPath: 'inset(0% 100% 0% 0%)', xPercent: -8 },
        { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 0, ease: 'apple', duration: 0.52 },
        0.04
      )
      tl.to(heading.current, { xPercent: 10, opacity: 0.12, ease: 'none' }, 0.66)

      // Specs clip in individually.
      Array.from(specs.current.children).forEach((child, i) => {
        tl.fromTo(
          child,
          { clipPath: 'inset(0% 100% 0% 0%)', xPercent: 6 },
          { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 0, ease: 'apple', duration: 0.3, delay: i * 0.06 },
          0.3
        )
      })

      tl.fromTo(faucet.current, { yPercent: 24, opacity: 0 }, { yPercent: -18, opacity: 1, ease: 'none' }, 0.16)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="kitchen" length={2.2} darkness={0.08} background="#F2EFEA">
        {/* Floating plate — perspective lives on the parent so the child stays flat-composited */}
        <div className="absolute inset-0" style={{ perspective: '1200px' }}>
          <div ref={plate} className="absolute inset-0 will-move" style={{ transformStyle: 'preserve-3d' }}>
            <ScrollVideo
              src={VIDEOS.kitchenIsland}
              poster={IMAGES.kitchenIsland}
              trigger={root}
              start="top top"
              end={() => `+=${window.innerHeight * 2.2}`}
              range={[0.02, 0.94]}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Cast shadow beneath the floating object */}
        <div
          ref={shadow}
          className="pointer-events-none absolute bottom-[9%] left-1/2 h-[7vh] w-[58vw] -translate-x-1/2 rounded-[50%] bg-ink/40 will-move"
        />

        {/* Dark scrim for text legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(21,21,21,0.55) 0%, rgba(21,21,21,0.2) 35%, rgba(21,21,21,0) 60%)',
          }}
        />

        <img
          ref={faucet}
          src={IMAGES.brassFaucet}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute right-[5%] top-[16%] hidden w-[10vw] max-w-[150px] object-contain mix-blend-multiply will-move lg:block"
        />

        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 sm:px-6 py-8 sm:py-10 md:px-12 md:py-16">
          <div className="flex items-start justify-between">
            <span className="eyebrow text-white/70">02 — The Kitchen</span>
            <span className="eyebrow hidden text-white/60 md:block">Object 02 / Marble Island</span>
          </div>

          <h2 ref={heading} className="display-lg max-w-[16ch] text-white will-move">
            Stone,
            <br />
            <span className="italic text-accent">weightless.</span>
          </h2>

          <div ref={specs} className="grid max-w-3xl grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-4">
            {SPECS.map(([k, v]) => (
              <div key={k} className="will-move border-t border-white/30 pt-2 sm:pt-3">
                <p className="eyebrow mb-1 sm:mb-1.5 text-white/65">{k}</p>
                <p className="body-sm text-white/80">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Chapter>
    </div>
  )
}
