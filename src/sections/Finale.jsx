import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * FINALE — the villa assembles.
 *
 * Three statements occupy the same optical centre in sequence. They are never
 * on screen together and never move sideways: each rises, holds, and is lifted
 * away by the next.
 *
 * Dawn returns underneath — the dark blueprint world resolves back to bone.
 */
export default function Finale() {
  const root = useRef(null)
  const plate = useRef(null)
  const dawn = useRef(null)
  const l1 = useRef(null)
  const l2 = useRef(null)
  const cta = useRef(null)
  const ctaLine = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.6}`,
          scrub: 1.3,
          invalidateOnRefresh: true,
        },
      })

      // Night lifts.
      tl.fromTo(dawn.current, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.3 }, 0)

      tl.fromTo(plate.current, { scale: 1.16 }, { scale: 1.0, ease: 'none' }, 0)
      tl.to(plate.current, { scale: 1.06, ease: 'none' }, 0.62)

      const statement = (el, at) => {
        tl.fromTo(el, { yPercent: 58, opacity: 0, filter: 'blur(20px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.2 }, at)
        tl.to(el, { yPercent: -52, opacity: 0, filter: 'blur(16px)', ease: 'apple', duration: 0.18 }, at + 0.26)
      }

      statement(l1.current, 0.14)
      statement(l2.current, 0.44)

      // The CTA is the only thing that stays.
      tl.fromTo(cta.current, { yPercent: 46, opacity: 0, filter: 'blur(18px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.22 }, 0.74)
      tl.fromTo(ctaLine.current, { scaleX: 0 }, { scaleX: 1, ease: 'apple', duration: 0.24 }, 0.82)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="finale" length={3.6} darkness={0.15} background="#F7F5F2">
        <div ref={plate} className="absolute inset-0 will-move">
          <ScrollVideo
            src={VIDEOS.villaAssembly}
            poster={IMAGES.villaModel}
            trigger={root}
            start="top top"
            end={() => `+=${window.innerHeight * 3.6}`}
            range={[0.02, 0.94]}
            className="h-full w-full"
          />
          {/* Dark scrim for text legibility over bright video */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(21,21,21,0.45) 0%, rgba(21,21,21,0.15) 35%, rgba(21,21,21,0) 60%), radial-gradient(130% 100% at 50% 50%, rgba(21,21,21,0) 20%, rgba(21,21,21,0.2) 100%)',
            }}
          />
        </div>

        <div ref={dawn} className="pointer-events-none absolute inset-0 bg-dark will-move" />

        <div className="pointer-events-none relative z-30 flex h-full flex-col items-center justify-center px-5 sm:px-6 text-center">
          <div className="relative flex h-[50vh] sm:h-[46vh] w-full max-w-6xl items-center justify-center">
            <h2 ref={l1} className="display-lg absolute text-white will-move">
              Designed
              <br className="hidden sm:block" />
              <span className="block sm:inline italic text-accent">For Living.</span>
            </h2>

            <h2 ref={l2} className="display-lg absolute text-white will-move">
              Our Spaces
              <br className="hidden sm:block" />
              <span className="block sm:inline italic text-accent">Tell Stories.</span>
            </h2>

            <div ref={cta} className="absolute flex flex-col items-center will-move">
              <p className="eyebrow mb-6 sm:mb-8 text-white/60">Commissions open — 2027</p>
              <a
                href="#contact"
                className="pointer-events-auto group inline-flex flex-col items-center"
                onClick={(e) => {
                  e.preventDefault()
                  window.__lenis
                    ? window.__lenis.scrollTo('#contact', { duration: 2.4 })
                    : document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span className="display-md text-white transition-[letter-spacing] duration-700 ease-apple group-hover:tracking-[-0.02em]">
                  Start Your Project
                </span>
                <span
                  ref={ctaLine}
                  className="mt-2 sm:mt-3 block h-[1.5px] w-full origin-left bg-accent will-move"
                />
              </a>
            </div>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
