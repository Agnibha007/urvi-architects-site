import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import { VIDEOS, IMAGES } from '@/lib/assets'

const COPY = [
  'The first room is always a question about light.',
  'Travertine drinks the morning and gives it back warmer.',
  'Nothing here is placed. Everything is positioned.',
]

/**
 * LIVING ROOM — the travertine table.
 *
 * The chapter opens still holding the hero's bone-white scrim and dissolves it
 * as the room furnishes itself. The table scales very slightly the whole way
 * through — 1.0 → 1.09 — which is below conscious perception but reads as the
 * camera continuing to approach.
 */
export default function LivingRoom() {
  const root = useRef(null)
  const plate = useRef(null)
  const light = useRef(null)
  const heading = useRef(null)
  const lines = useRef(null)
  const lamp = useRef(null)
  const sculpture = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.0}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(plate.current, { scale: 1.0, yPercent: 3 }, { scale: 1.09, yPercent: -3, ease: 'none' }, 0)

      // Lighting drifts from cool morning to warm afternoon across the chapter.
      tl.fromTo(
        light.current,
        { opacity: 0.34, background: 'radial-gradient(70% 55% at 22% 18%, rgba(214,228,238,0.95), rgba(247,245,242,0) 70%)' },
        { opacity: 0.5, background: 'radial-gradient(78% 62% at 74% 34%, rgba(246,224,190,0.95), rgba(247,245,242,0) 72%)', ease: 'none' },
        0
      )

      tl.fromTo(heading.current, { yPercent: 26, opacity: 0, filter: 'blur(14px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.4 }, 0.06)
      tl.to(heading.current, { yPercent: -22, opacity: 0.15, ease: 'none' }, 0.6)

      // Paragraph arrives line by line, never as a block.
      tl.fromTo(
        lines.current.children,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: 'apple', duration: 0.28, stagger: 0.14 },
        0.22
      )

      // Side objects parallax at different rates — depth without a 3D cost.
      tl.fromTo(lamp.current, { yPercent: 18, opacity: 0 }, { yPercent: -26, opacity: 1, ease: 'none' }, 0.1)
      tl.fromTo(sculpture.current, { yPercent: 32, opacity: 0 }, { yPercent: -12, opacity: 1, ease: 'none' }, 0.24)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="living" length={1.0} darkness={0} background="#F7F5F2">
        <div ref={plate} className="absolute inset-0 will-move">
          <ScrollVideo
            src={VIDEOS.livingTable}
            poster={IMAGES.coffeeTable}
            trigger={root}
            start="top top"
            end={() => `+=${window.innerHeight * 1.0}`}
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
              'linear-gradient(to top, rgba(21,21,21,0.5) 0%, rgba(21,21,21,0.2) 40%, rgba(21,21,21,0) 65%), radial-gradient(130% 100% at 50% 50%, rgba(21,21,21,0) 20%, rgba(21,21,21,0.2) 100%)',
          }}
        />

        {/* Discrete objects — each stands alone, never composited together. */}
        <img
          ref={lamp}
          src={IMAGES.floorLamp}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute left-[3%] top-[12%] hidden w-[13vw] max-w-[190px] object-contain mix-blend-multiply will-move lg:block"
        />
        <img
          ref={sculpture}
          src={IMAGES.sculpture}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[8%] right-[4%] hidden w-[11vw] max-w-[160px] object-contain mix-blend-multiply will-move lg:block"
        />

        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 sm:px-6 py-8 sm:py-10 md:px-12 md:py-16">
          <span className="eyebrow text-white/70">01 — The Living Room</span>

          <div className="max-w-[52rem]">
            <h2 ref={heading} className="display-lg text-white will-move">
              A room that
              <br />
              <span className="italic text-accent">holds the hour.</span>
            </h2>
          </div>

          <div ref={lines} className="max-w-[36rem]">
            {COPY.map((line) => (
              <span key={line} className="line-mask">
                <span className="body-sm block text-white/70 will-move">{line}</span>
              </span>
            ))}
          </div>
        </div>
      </Chapter>
    </div>
  )
}
