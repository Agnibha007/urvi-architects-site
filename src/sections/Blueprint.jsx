import { useCallback, useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import ScrollVideo from '@/components/ScrollVideo'
import { VIDEOS, IMAGES } from '@/lib/assets'

/**
 * APPROACH / PROCESS — the architectural drawing as metaphor for design thinking.
 *
 * The world goes dark here. The video carries the extrusion; the R3F
 * `WireframeVilla` is gated to this chapter and its GLSL build-sweep is driven
 * by the same scroll progress. The editorial framing presents this as the
 * studio's design process — from concept to construction.
 */
export default function Blueprint({ buildRef }) {
  const root = useRef(null)
  const plate = useRef(null)
  const night = useRef(null)
  const grid = useRef(null)
  const labels = useRef(null)
  const title = useRef(null)
  const rule = useRef(null)
  const desc = useRef(null)

  const onProgress = useCallback(
    (p) => {
      if (buildRef) buildRef.current = gsap.utils.clamp(0, 1, (p - 0.1) / 0.62)
    },
    [buildRef]
  )

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.8}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      // Night falls, and lifts again just before the finale.
      tl.fromTo(night.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.14 }, 0)
      tl.to(night.current, { opacity: 0.92, ease: 'none' }, 0.8)

      tl.fromTo(plate.current, { scale: 1.18, opacity: 0 }, { scale: 1.0, opacity: 1, ease: 'none', duration: 0.24 }, 0.05)
      tl.to(plate.current, { scale: 1.08, ease: 'none' }, 0.55)

      // Drafting grid draws itself in.
      tl.fromTo(grid.current, { opacity: 0, scale: 1.1 }, { opacity: 0.18, scale: 1, ease: 'none', duration: 0.26 }, 0.06)

      // Measurement rule extends.
      tl.fromTo(rule.current, { scaleX: 0 }, { scaleX: 1, ease: 'apple', duration: 0.3 }, 0.14)

      // Title wipes in from below — clip-mask, not a fade.
      tl.fromTo(
        title.current,
        { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 8 },
        { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, ease: 'apple', duration: 0.34 },
        0.1
      )

      // Description arrives.
      tl.fromTo(desc.current, { yPercent: 20, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.3 }, 0.22)

      // Labels clip in from the left — drafting-table tick marks.
      Array.from(labels.current.children).forEach((child, i) => {
        tl.fromTo(
          child,
          { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
          { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, ease: 'apple', duration: 0.18, delay: i * 0.07 },
          0.28
        )
      })

      tl.to([labels.current, grid.current, rule.current], { opacity: 0, ease: 'none', duration: 0.12 }, 0.84)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <Chapter id="blueprint" length={1.8} darkness={1} background="#101010" onProgress={onProgress}>
        <div ref={night} className="absolute inset-0 bg-dark opacity-0 will-move" />

        <div ref={plate} className="absolute inset-0 opacity-0 will-move">
          <ScrollVideo
            src={VIDEOS.blueprintVilla}
            poster={IMAGES.blueprint}
            trigger={root}
            start="top top"
            end={() => `+=${window.innerHeight * 1.8}`}
            range={[0.06, 0.9]}
            fit="contain"
            className="h-full w-full"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>

        {/* Drafting grid — pure CSS, one composited layer, zero DOM nodes */}
        <div
          ref={grid}
          className="pointer-events-none absolute inset-0 opacity-0 will-move"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(159,214,232,0.30) 1px, transparent 1px),' +
              'linear-gradient(to bottom, rgba(159,214,232,0.30) 1px, transparent 1px),' +
              'linear-gradient(to right, rgba(159,214,232,0.10) 1px, transparent 1px),' +
              'linear-gradient(to bottom, rgba(159,214,232,0.10) 1px, transparent 1px)',
            backgroundSize: '160px 160px, 160px 160px, 32px 32px, 32px 32px',
          }}
        />

        {/* Technical labels — hidden on mobile, visible on md+ */}
        <div ref={labels} className="pointer-events-none absolute inset-0 z-30 hidden md:block">
          {[
            { t: 'I', d: 'Concept' },
            { t: 'II', d: 'Schematic' },
            { t: 'III', d: 'Detail' },
            { t: 'IV', d: 'Construction' },
            { t: 'V', d: 'Completion' },
          ].map((l, i) => (
            <div
              key={l.t}
              className="absolute will-move"
              style={{
                left: `${14 + i * 16}%`,
                top: i % 2 === 0 ? '22%' : '68%',
              }}
            >
              <span className="block h-[7px] w-[7px] -translate-x-1/2 rounded-full border border-[#9FD6E8] bg-[#9FD6E8]/20" />
              <span className="mt-2 block h-[1px] w-10 bg-[#9FD6E8]/35" />
              <p className="eyebrow mt-1.5 text-[#9FD6E8]/80">{l.t}</p>
              <p className="font-sans text-[10px] font-light tracking-wide text-[#9FD6E8]/50">{l.d}</p>
            </div>
          ))}
        </div>

        <div className="pointer-events-none relative z-40 flex h-full flex-col justify-between px-5 sm:px-6 py-8 sm:py-10 md:px-12 md:py-16">
          <div className="flex items-start justify-between">
            <span className="eyebrow text-[#9FD6E8]/50">03</span>
            <span className="eyebrow hidden sm:inline text-[#9FD6E8]/40">Approach &amp; Process</span>
          </div>

          <div className="max-w-[44rem]">
            <div ref={title} className="will-move">
              <h2 className="display-lg text-[#F0F4F5]">
                From line
                <br />
                <span className="italic text-[#9FD6E8]">to lived space.</span>
              </h2>
              <div ref={rule} className="mt-6 sm:mt-8 h-[1px] w-full max-w-md origin-left bg-[#9FD6E8]/35 will-move" />
            </div>
          </div>

          <div ref={desc} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8 will-move">
            <p className="body-sm max-w-[34ch] text-[#9FD6E8]/45">
              Every project begins as geometry and becomes weather. We draw the first so carefully
              that the second can be left alone.
            </p>
            <span className="eyebrow hidden md:block text-[#9FD6E8]/40">GFA 412 m² / Plot 1,840 m²</span>
          </div>
        </div>
      </Chapter>
    </div>
  )
}
