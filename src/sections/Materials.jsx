import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import { MATERIALS } from '@/lib/assets'

/**
 * MATERIALS — the material library as gallery specimen.
 *
 * The cube is the live R3F `MaterialCube`, which reads
 * `scrollStore.local` for its rotation and `cubeColorRef` for its surface.
 *
 * PERFORMANCE: Uses ref-driven DOM updates instead of useState to avoid
 * re-rendering 6 material items on every scroll tick through this chapter.
 */
export default function Materials({ cubeColorRef }) {
  const root = useRef(null)
  const wash = useRef(null)
  const listRef = useRef(null)
  const headRef = useRef(null)
  const activeRef = useRef(0)
  const itemRefs = useRef([])

  const onProgress = useCallback(
    (p) => {
      const t = gsap.utils.clamp(0, 0.9999, (p - 0.08) / 0.84)
      const idx = Math.floor(t * MATERIALS.length)
      if (idx !== activeRef.current) {
        activeRef.current = idx
        if (cubeColorRef) cubeColorRef.current = MATERIALS[idx].hex
        // Direct DOM update — no React re-render.
        itemRefs.current.forEach((el, i) => {
          if (!el) return
          const on = i === idx
          el.style.opacity = on ? '1' : '0.22'
          el.style.transform = on ? 'translate3d(0,0,0)' : 'translate3d(-3px,0,0)'
          // Update the expandable note.
          const note = el.querySelector('[data-material-note]')
          const name = el.querySelector('[data-material-name]')
          if (note) note.style.gridTemplateRows = on ? '1fr' : '0fr'
          if (name) name.style.letterSpacing = on ? '-0.02em' : '-0.04em'
        })
      }
    },
    [cubeColorRef]
  )

  useLayoutEffect(() => {
    if (cubeColorRef) cubeColorRef.current = MATERIALS[0].hex

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.0}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      // Bone → pure white → bone.
      tl.fromTo(wash.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.18 }, 0)
      tl.to(wash.current, { opacity: 0, ease: 'none', duration: 0.16 }, 0.86)

      tl.fromTo(headRef.current, { yPercent: 30, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.22 }, 0.04)

      tl.fromTo(
        listRef.current.children,
        { xPercent: 12, opacity: 0 },
        { xPercent: 0, opacity: 1, ease: 'apple', duration: 0.2, stagger: 0.055 },
        0.1
      )
    }, root)

    return () => ctx.revert()
  }, [cubeColorRef])

  return (
    <div ref={root}>
      <Chapter id="materials" length={2.0} darkness={0} background="#F7F5F2" onProgress={onProgress}>
        <div ref={wash} className="pointer-events-none absolute inset-0 bg-white opacity-0 will-move" />

        <div className="relative z-30 grid h-full grid-cols-1 gap-6 sm:gap-8 px-5 sm:px-6 py-8 sm:py-10 md:grid-cols-2 md:px-12 md:py-16">
          {/* Left — the specimen sits in the 3D layer behind this column */}
          <div className="flex flex-col justify-between">
            <span className="eyebrow text-ink/50">04</span>
            <div>
              <h2 ref={headRef} className="display-md max-w-[14ch] text-ink will-move">
                Six
                <br />
                <span className="italic text-accent">materials.</span>
              </h2>
              <p className="body-sm mt-3 sm:mt-4 max-w-[30ch] text-ink/45 hidden md:block">
                Each chosen for how it receives, holds and releases light across the hours of a day.
              </p>
            </div>
            <span className="eyebrow hidden text-ink/35 md:block">Specimen rotating — 360°</span>
          </div>

          {/* Right — the index */}
          <div ref={listRef} className="flex flex-col justify-center gap-0 self-center">
            {MATERIALS.map((m, i) => (
              <div
                key={m.name}
                ref={(el) => { itemRefs.current[i] = el }}
                className="will-move border-t border-ink/10 py-2.5 sm:py-3.5 md:py-5"
                style={{
                  transition: 'opacity 1400ms var(--ease-subtle), transform 1400ms var(--ease-subtle)',
                  opacity: i === 0 ? 1 : 0.22,
                  transform: i === 0 ? 'translate3d(0,0,0)' : 'translate3d(-3px,0,0)',
                }}
              >
                <div className="flex items-baseline justify-between gap-3 sm:gap-6">
                  <div className="flex items-baseline gap-2.5 sm:gap-4 md:gap-6">
                    <span className="eyebrow w-5 sm:w-6 shrink-0 text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                    <h3
                      data-material-name
                      className="!text-[clamp(1.2rem,4.2vw,3.4rem)] font-display leading-none"
                      style={{
                        color: '#151515',
                        transition: 'letter-spacing 1400ms var(--ease-subtle)',
                        letterSpacing: i === 0 ? '-0.02em' : '-0.04em',
                      }}
                    >
                      {m.name}
                    </h3>
                  </div>
                  <span
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 rounded-full ring-1 ring-ink/8"
                    style={{
                      background: m.hex,
                      transform: i === 0 ? 'scale(1)' : 'scale(0.55)',
                      transition: 'transform 1400ms var(--ease-subtle)',
                    }}
                  />
                </div>
                <div
                  data-material-note
                  className="grid overflow-hidden will-move"
                  style={{
                    gridTemplateRows: i === 0 ? '1fr' : '0fr',
                    transition: 'grid-template-rows 1400ms var(--ease-subtle)',
                  }}
                >
                  <div className="min-h-0">
                    <p className="body-sm ml-7 sm:ml-10 pt-1.5 sm:pt-2 text-ink/50 md:ml-[3.1rem]">
                      {m.note} <span className="text-ink/35">— {m.origin}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-ink/10" />
          </div>
        </div>
      </Chapter>
    </div>
  )
}
