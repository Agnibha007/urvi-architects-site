import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * PROJECT 01 — Editorial architecture case study.
 *
 * The kitchen becomes a penthouse project. Each project includes: name, type,
 * location, year, short architectural description, large visual, and minimal
 * metadata. The presentation is asymmetric with generous whitespace.
 */
export default function Kitchen() {
  const root = useRef(null)
  const plate = useRef(null)
  const shadow = useRef(null)
  const heading = useRef(null)
  const meta = useRef(null)
  const label = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.0}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      // Camera zoom + the tilt settling.
      tl.fromTo(
        plate.current,
        { scale: 1.02, rotateX: 6, rotateY: -5, yPercent: 4 },
        { scale: 1.18, rotateX: 0, rotateY: 2, yPercent: -4, ease: 'none' },
        0
      )

      // Contact shadow tightens as the object "settles".
      tl.fromTo(
        shadow.current,
        { opacity: 0.1, scaleX: 1.2 },
        { opacity: 0.22, scaleX: 0.88, ease: 'none' },
        0
      )

      // Project label fades in.
      tl.fromTo(label.current, { opacity: 0 }, { opacity: 1, ease: 'power1.out', duration: 0.2 }, 0.04)

      // Heading clips in from below — editorial reveal.
      tl.fromTo(
        heading.current,
        { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 8 },
        { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, ease: 'apple', duration: 0.48 },
        0.04
      )
      tl.to(heading.current, { yPercent: -8, opacity: 0.12, ease: 'none' }, 0.62)

      // Metadata grid arrives gently.
      tl.fromTo(meta.current, { yPercent: 30, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.3 }, 0.28)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="kitchen" length={3.0} darkness={0.08} background="#F2EFEA">
        {/* Floating plate — perspective lives on the parent so the child stays flat-composited */}
        <div className="absolute inset-0" style={{ perspective: '1200px' }}>
          <div ref={plate} className="absolute inset-0 will-move" style={{ transformStyle: 'preserve-3d' }}>
            <ScrollVideo
              src={VIDEOS.kitchenIsland}
              poster={IMAGES.kitchenIsland}
              sectionId="kitchen"
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

        <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 sm:px-6 py-8 sm:py-10 md:px-12 md:py-16">
          <div ref={label} className="flex items-start justify-between will-move">
            <span className="eyebrow text-white/60">01</span>
            <span className="eyebrow hidden text-white/40 md:block">Project 01 / Residential</span>
          </div>

          <div className="max-w-[18ch]">
            <h2 ref={heading} className="display-lg text-white will-move">
              The
              <br />
              Penthouse.
            </h2>
          </div>

          {/* Project metadata — editorial style */}
          <div ref={meta} className="will-move">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4">
                <div>
                  <p className="eyebrow mb-1.5 text-white/50">Location</p>
                  <p className="body-sm text-white/75">Roma, Italia</p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5 text-white/50">Year</p>
                  <p className="body-sm text-white/75">2024</p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5 text-white/50">Type</p>
                  <p className="body-sm text-white/75">Penthouse</p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5 text-white/50">Area</p>
                  <p className="body-sm text-white/75">280 m²</p>
                </div>
              </div>
              <p className="body-sm hidden max-w-[30ch] text-white/45 md:block">
                Calacatta Viola marble island, unlacquered brass fittings, board-formed concrete.
              </p>
            </div>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
