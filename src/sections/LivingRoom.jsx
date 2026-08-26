import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * SELECTED WORK — editorial introduction to the portfolio.
 *
 * This section establishes the studio's design philosophy and introduces the
 * three featured projects. The video carries the visual; the text provides
 * editorial context. The chapter keeps its internal id ('living') for 3D
 * camera continuity, but reads as a portfolio showcase.
 */
export default function LivingRoom() {
  const root = useRef(null)
  const plate = useRef(null)
  const light = useRef(null)
  const heading = useRef(null)
  const desc = useRef(null)
  const label = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.5}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(plate.current, { scale: 1.0, yPercent: 3 }, { scale: 1.08, yPercent: -2, ease: 'none' }, 0)

      // Lighting drifts from cool morning to warm afternoon across the chapter.
      tl.fromTo(
        light.current,
        { opacity: 0.34, background: 'radial-gradient(70% 55% at 22% 18%, rgba(214,228,238,0.95), rgba(247,245,242,0) 70%)' },
        { opacity: 0.5, background: 'radial-gradient(78% 62% at 74% 34%, rgba(246,224,190,0.95), rgba(247,245,242,0) 72%)', ease: 'none' },
        0
      )

      tl.fromTo(heading.current, { yPercent: 26, opacity: 0, filter: 'blur(14px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.4 }, 0.06)
      tl.to(heading.current, { yPercent: -18, opacity: 0.15, ease: 'none' }, 0.62)

      // Description arrives subtly.
      tl.fromTo(desc.current, { yPercent: 40, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.3 }, 0.18)
      tl.to(desc.current, { opacity: 0, ease: 'none' }, 0.6)

      // Label fades in early.
      tl.fromTo(label.current, { opacity: 0 }, { opacity: 1, ease: 'power1.out', duration: 0.2 }, 0.04)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="living" length={1.5} darkness={0} background="#F7F5F2">
        <div ref={plate} className="absolute inset-0 will-move">
          <ScrollVideo
            src={VIDEOS.livingTable}
            poster={IMAGES.coffeeTable}
            trigger={root}
            start="top top"
            end={() => `+=${window.innerHeight * 1.5}`}
            range={[0.04, 0.92]}
            className="h-full w-full"
          />
        </div>

        {/* Light layer */}
        <div ref={light} className="pointer-events-none absolute inset-0 mix-blend-multiply will-move" />

        {/* Dark scrim for text legibility over bright video */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(21,21,21,0.55) 0%, rgba(21,21,21,0.2) 40%, rgba(21,21,21,0) 65%), radial-gradient(130% 100% at 50% 50%, rgba(21,21,21,0) 20%, rgba(21,21,21,0.2) 100%)',
          }}
        />

        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 sm:px-6 py-8 sm:py-10 md:px-12 md:py-16">
          <div ref={label} className="flex items-start justify-between will-move">
            <span className="eyebrow text-white/60">Selected Work</span>
            <span className="eyebrow hidden text-white/40 md:block">Three Featured Projects</span>
          </div>

          <div className="max-w-[52rem]">
            <h2 ref={heading} className="display-lg text-white will-move">
              Architecture
              <br />
              <span className="italic text-accent">in practice.</span>
            </h2>
          </div>

          <div ref={desc} className="max-w-[36rem] will-move">
            <p className="body-sm text-white/60">
              A curated selection of spaces where architecture, interior design and
              material craft converge. Each project is a conversation between light,
              mass and the lives lived within.
            </p>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
