import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import SplitText from '@/components/SplitText'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * BEDROOM — the bed assembles, then the curtains open, then the light descends.
 *
 * Two clips share one pin. The bed assembly runs 0 → 0.55; the pendant light
 * clip runs 0.55 → 1 and cross-fades in underneath.
 *
 * Typography is deliberately withheld until the bed is finished — the room is
 * allowed to be quiet first.
 */
export default function Bedroom() {
  const root = useRef(null)
  const bedPlate = useRef(null)
  const lampPlate = useRef(null)
  const curtainL = useRef(null)
  const curtainR = useRef(null)
  const warm = useRef(null)
  const type = useRef(null)
  const quote = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.2}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      })

      // --- Curtains. A clip-path reveal.
      tl.fromTo(curtainL.current, { xPercent: 0 }, { xPercent: -102, ease: 'apple', duration: 0.34 }, 0.02)
      tl.fromTo(curtainR.current, { xPercent: 0 }, { xPercent: 102, ease: 'apple', duration: 0.34 }, 0.02)

      // --- Bed assembles under a slow drift.
      tl.fromTo(bedPlate.current, { scale: 1.12, yPercent: 2 }, { scale: 1.0, yPercent: -2, ease: 'none' }, 0)

      // --- Warm light builds as the room finishes.
      tl.fromTo(warm.current, { opacity: 0 }, { opacity: 0.55, ease: 'none' }, 0.15)

      // --- Handover to the pendant clip.
      tl.fromTo(bedPlate.current, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.16 }, 0.54)
      tl.fromTo(lampPlate.current, { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1.0, ease: 'none', duration: 0.2 }, 0.52)

      // --- Only now does the language arrive.
      tl.fromTo(type.current, { yPercent: 40, opacity: 0, filter: 'blur(18px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.3 }, 0.4)
      tl.fromTo(quote.current, { yPercent: 24, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'apple', duration: 0.26 }, 0.58)

      // --- The room dims into the material chapter.
      tl.to([type.current, quote.current], { opacity: 0, yPercent: -18, ease: 'none' }, 0.86)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="bedroom" length={1.2} darkness={0.45} background="#EDE8E1">
        {/* Bed assembly */}
        <div ref={bedPlate} className="absolute inset-0 will-move">
          <ScrollVideo
            src={VIDEOS.bedroomBed}
            poster={IMAGES.kingBed}
            trigger={root}
            start="top top"
            end={() => `+=${window.innerHeight * 1.2}`}
            range={[0.02, 0.56]}
            className="h-full w-full"
          />
        </div>

        {/* Pendant descends — takes over the same frame */}
        <div ref={lampPlate} className="absolute inset-0 opacity-0 will-move">
          <ScrollVideo
            src={VIDEOS.pendantLight}
            trigger={root}
            start="top top"
            end={() => `+=${window.innerHeight * 1.2}`}
            range={[0.5, 0.98]}
            className="h-full w-full"
          />
        </div>

        {/* Warm evening wash */}
        <div
          ref={warm}
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light will-move"
          style={{ background: 'radial-gradient(80% 65% at 50% 30%, #F4D9AE 0%, rgba(244,217,174,0) 72%)' }}
        />

        {/* Dark scrim for text legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(21,21,21,0.5) 0%, rgba(21,21,21,0.15) 40%, rgba(21,21,21,0) 65%)',
          }}
        />

        {/* Curtains */}
        <div ref={curtainL} className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-[#E4DED5] will-move" />
        <div ref={curtainR} className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-[#E4DED5] will-move" />

        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 sm:px-6 py-8 sm:py-10 md:px-12 md:py-16">
          <span className="eyebrow text-white/60">03 — The Bedroom</span>

          <div ref={type} className="max-w-[46rem] will-move">
            <h2 className="display-lg text-white">
              <SplitText by="word" stagger={0.07} duration={1.4} start="top 90%">
                Built for the
              </SplitText>
              <br className="hidden sm:block" />
              <span className="block sm:inline italic text-accent">
                <SplitText by="word" stagger={0.07} duration={1.4} start="top 90%">
                  end of the day.
                </SplitText>
              </span>
            </h2>
          </div>

          <div ref={quote} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-10 will-move">
            <p className="body-sm max-w-[38ch] text-white/65">
              Linen in three weights. A single pendant, lowered until it is almost furniture.
              Everything at the height of a person lying down.
            </p>
            <span className="eyebrow hidden sm:block text-white/60">2700 K — 12 lux</span>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
