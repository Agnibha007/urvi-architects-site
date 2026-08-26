import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import SplitText from '@/components/SplitText'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * HERO — Architecture & Interior Design Studio identity.
 *
 * The hero establishes URVI as a premium architecture/interior/spatial design
 * studio. Large Instrument Serif typography, strong architectural visual, minimal
 * supporting text, and a subtle scroll indicator. Motion should feel cinematic
 * and physical rather than flashy.
 */
export default function Hero() {
  const root = useRef(null)
  const videoWrap = useRef(null)
  const title = useRef(null)
  const sub = useRef(null)
  const scrim = useRef(null)
  const cue = useRef(null)
  const studioLabel = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.8}`,
          scrub: 1.0,
          invalidateOnRefresh: true,
        },
      })

      // Title breaks apart and drifts back as the chair explodes.
      tl.to(title.current, { yPercent: -18, letterSpacing: '0.02em', filter: 'blur(1px)', ease: 'none' }, 0)
        .to(sub.current, { yPercent: -60, opacity: 0, ease: 'none' }, 0)
        .to(cue.current, { opacity: 0, y: 20, duration: 0.15 }, 0)
        .to(studioLabel.current, { opacity: 0, yPercent: -30, ease: 'none' }, 0)

      // Slow push-in — restrained to keep 1080p sharp on high-DPI.
      tl.fromTo(
        videoWrap.current,
        { scale: 1.02, yPercent: 0 },
        { scale: 1.14, yPercent: -3, ease: 'none' },
        0
      )
        // Lift-off: chair exits upward, text dissolves.
        .to(videoWrap.current, { yPercent: -40, scale: 1.22, ease: 'apple' }, 0.7)
        .to(title.current, { yPercent: -140, opacity: 0, filter: 'blur(14px)', ease: 'apple' }, 0.72)

      // Transition scrim — starts earlier, longer duration for a smoother crossfade.
      tl.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0.72)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="hero" length={1.8} darkness={0}>
        {/* Media plate */}
        <div ref={videoWrap} className="absolute inset-0 will-move">
          <ScrollVideo
            src={VIDEOS.heroChair}
            poster={IMAGES.loungeChair}
            trigger={root}
            eager
            start="top top"
            end={() => `+=${window.innerHeight * 1.8}`}
            range={[0, 0.88]}
            className="h-full w-full"
            style={{ objectPosition: '50% 50%' }}
          />
          {/* Two-layer vignette:
              1. Edge darkening — radial, pushes the eye inward.
              2. Lower scrim — linear, creates a readable zone for the bottom text. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(130% 100% at 50% 40%, rgba(21,21,21,0) 30%, rgba(21,21,21,0.25) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(21,21,21,0.5) 0%, rgba(21,21,21,0.18) 35%, rgba(21,21,21,0) 60%)',
            }}
          />
        </div>

        <div ref={scrim} className="pointer-events-none absolute inset-0 bg-bone opacity-0" />

        {/* Type plate */}
        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 sm:px-6 py-6 sm:py-8 md:px-12 md:py-12">
          {/* Studio label — top left */}
          <div ref={studioLabel} className="will-move">
            <span className="eyebrow text-white/60">Andhra Pradesh &amp; Telangana — India</span>
          </div>

          {/* Main title — large Instrument Serif */}
          <div ref={title} className="will-move">
            <h1 className="display-xl text-white">
              <SplitText by="char" stagger={0.032} duration={1.5} delay={0.35}>
                URVI
              </SplitText>
            </h1>
            <p className="mt-3 sm:mt-4 font-sans text-[11px] sm:text-[12px] md:text-[13px] uppercase tracking-micro text-white/50">
              <SplitText by="char" stagger={0.02} duration={1.2} delay={0.6}>
                Architecture &amp; Interiors
              </SplitText>
            </p>
          </div>

          {/* Bottom row — philosophy + scroll cue */}
          <div ref={sub} className="will-move">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <p className="body-sm hidden max-w-[34ch] text-white/50 md:block">
                We do not decorate rooms. We compose the conditions — light, mass, material and
                silence — under which a life is worth living slowly.
              </p>
              <div ref={cue} className="eyebrow flex items-center gap-3 text-white/50 will-move">
                <span className="inline">Scroll</span>
                <span className="block h-[1px] w-10 origin-left bg-white/40 md:w-16" />
              </div>
            </div>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
