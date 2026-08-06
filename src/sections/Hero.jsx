import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import SplitText from '@/components/SplitText'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * HERO — the chair.
 *
 * The clip itself carries rotate → explode → reassemble. What this section adds
 * is the camera: the frame pushes in, the chair rises out of the top of the
 * screen at the very end of the pin, and the title splits apart around it.
 * By the time the pin releases, the chair has already left — so the living room
 * doesn't begin, it's simply what's behind.
 */
export default function Hero() {
  const root = useRef(null)
  const videoWrap = useRef(null)
  const title = useRef(null)
  const sub = useRef(null)
  const scrim = useRef(null)
  const cue = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3}`,
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      })

      // Title breaks apart and drifts back as the chair explodes.
      tl.to(title.current, { yPercent: -18, letterSpacing: '0.02em', filter: 'blur(1px)', ease: 'none' }, 0)
        .to(sub.current, { yPercent: -60, opacity: 0, ease: 'none' }, 0)
        .to(cue.current, { opacity: 0, y: 20, duration: 0.15 }, 0)

      // Slow push-in, then the lift-off.
      tl.fromTo(
        videoWrap.current,
        { scale: 1.08, yPercent: 0 },
        { scale: 1.24, yPercent: -6, ease: 'none' },
        0
      )
        .to(videoWrap.current, { yPercent: -46, scale: 1.34, ease: 'apple' }, 0.72)
        .to(title.current, { yPercent: -140, opacity: 0, filter: 'blur(14px)', ease: 'apple' }, 0.74)

      // Warm scrim closes over the frame — the "camera moving into the next room".
      tl.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.78)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="hero" length={3} darkness={0}>
        {/* Media plate */}
        <div ref={videoWrap} className="absolute inset-0 will-move">
          <ScrollVideo
            src={VIDEOS.heroChair}
            poster={IMAGES.loungeChair}
            trigger={root}
            eager
            start="top top"
            end={() => `+=${window.innerHeight * 3}`}
            range={[0, 0.78]}
            className="h-full w-full"
          />
          {/* Editorial vignette — never a gradient overlay for style, only for legibility. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 45%, rgba(247,245,242,0) 40%, rgba(247,245,242,0.55) 100%)',
            }}
          />
        </div>

        <div ref={scrim} className="pointer-events-none absolute inset-0 bg-bone opacity-0" />

        {/* Type plate */}
        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-12">
          <div className="flex items-start justify-between">
            <span className="eyebrow text-ink/50">Est. 2009 — Practice No. 4</span>
            <span className="eyebrow hidden text-ink/50 md:block">41.9028° N&nbsp;&nbsp;12.4964° E</span>
          </div>

          <div ref={title} className="will-move">
            <h1 className="display-xl text-ink">
              <SplitText by="char" stagger={0.032} duration={1.5} delay={0.35}>
                We Design
              </SplitText>
              <br />
              <span className="italic text-accent">
                <SplitText by="char" stagger={0.032} duration={1.5} delay={0.62}>
                  Experiences.
                </SplitText>
              </span>
            </h1>
          </div>

          <div ref={sub} className="flex items-end justify-between gap-8 will-move">
            <p className="eyebrow max-w-[16ch] text-ink/60 md:max-w-none">
              Urvi Architects — Luxury Interior Studio
            </p>
            <p className="body-sm hidden max-w-[34ch] text-ink/70 md:block">
              We do not decorate rooms. We compose the conditions — light, mass, material and
              silence — under which a life is worth living slowly.
            </p>
            <div ref={cue} className="eyebrow flex items-center gap-3 text-ink/40 will-move">
              <span className="hidden md:inline">Scroll</span>
              <span className="block h-[1px] w-10 origin-left bg-ink/30 md:w-16" />
            </div>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
