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
          end: () => `+=${window.innerHeight * 2.8}`,
          scrub: 1.15,
          invalidateOnRefresh: true,
        },
      })

      // Camera zoom + the tilt settling. rotateX easing to 0 is the "landing".
      tl.fromTo(
        plate.current,
        { scale: 1.02, rotateX: 9, rotateY: -7, yPercent: 5 },
        { scale: 1.22, rotateX: 0, rotateY: 3, yPercent: -5, ease: 'none' },
        0
      )

      // Contact shadow tightens as the object "settles" — sells the float.
      tl.fromTo(
        shadow.current,
        { opacity: 0.1, scaleX: 1.25, filter: 'blur(60px)' },
        { opacity: 0.26, scaleX: 0.86, filter: 'blur(34px)', ease: 'none' },
        0
      )

      // Heading slides in from the left, then continues past — one continuous move.
      tl.fromTo(heading.current, { xPercent: -34, opacity: 0, filter: 'blur(16px)' }, { xPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.42 }, 0.04)
      tl.to(heading.current, { xPercent: 14, opacity: 0.12, ease: 'none' }, 0.62)

      tl.fromTo(
        specs.current.children,
        { xPercent: 18, opacity: 0 },
        { xPercent: 0, opacity: 1, ease: 'apple', duration: 0.26, stagger: 0.1 },
        0.3
      )

      tl.fromTo(faucet.current, { yPercent: 24, opacity: 0 }, { yPercent: -18, opacity: 1, ease: 'none' }, 0.16)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="kitchen" length={2.8} darkness={0.08} background="#F2EFEA">
        {/* Floating plate — perspective lives on the parent so the child stays flat-composited */}
        <div className="absolute inset-0" style={{ perspective: '1600px' }}>
          <div ref={plate} className="absolute inset-0 will-move" style={{ transformStyle: 'preserve-3d' }}>
            <ScrollVideo
              src={VIDEOS.kitchenIsland}
              poster={IMAGES.kitchenIsland}
              trigger={root}
              start="top top"
              end={() => `+=${window.innerHeight * 2.8}`}
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

        <img
          ref={faucet}
          src={IMAGES.brassFaucet}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute right-[5%] top-[16%] hidden w-[10vw] max-w-[150px] object-contain mix-blend-multiply will-move lg:block"
        />

        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-6 py-10 md:px-12 md:py-16">
          <div className="flex items-start justify-between">
            <span className="eyebrow text-ink/45">02 — The Kitchen</span>
            <span className="eyebrow hidden text-ink/35 md:block">Object 02 / Marble Island</span>
          </div>

          <h2 ref={heading} className="display-lg max-w-[16ch] text-ink will-move">
            Stone,
            <br />
            <span className="italic text-accent">weightless.</span>
          </h2>

          <div ref={specs} className="grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
            {SPECS.map(([k, v]) => (
              <div key={k} className="will-move border-t border-ink/15 pt-3">
                <p className="eyebrow mb-1.5 text-ink/40">{k}</p>
                <p className="body-sm text-ink/75">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Chapter>
    </div>
  )
}
