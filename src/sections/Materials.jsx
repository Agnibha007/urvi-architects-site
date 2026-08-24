import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import Chapter from '@/components/Chapter'
import { MATERIALS } from '@/lib/assets'

/**
 * MATERIAL GALLERY.
 *
 * The cube is not a video — it is the live R3F `MaterialCube`, which reads
 * `scrollStore.local` for its rotation and `cubeColorRef` for its surface. That
 * means the cube's rotation and the highlighted label are literally driven by
 * the same number, so they can never drift out of sync the way a video + a
 * hardcoded timecode list eventually will.
 *
 * The background goes to pure white here — the only place in the film it does.
 */
export default function Materials({ cubeColorRef }) {
  const root = useRef(null)
  const wash = useRef(null)
  const listRef = useRef(null)
  const headRef = useRef(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  const onProgress = useCallback(
    (p) => {
      // Six faces across the chapter, with a small lead-in and lead-out.
      const t = gsap.utils.clamp(0, 0.9999, (p - 0.08) / 0.84)
      const idx = Math.floor(t * MATERIALS.length)
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
        if (cubeColorRef) cubeColorRef.current = MATERIALS[idx].hex
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
          end: () => `+=${window.innerHeight * 2.6}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      // Bone → pure white → bone. The white is the "studio" moment.
      tl.fromTo(wash.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.18 }, 0)
      tl.to(wash.current, { opacity: 0, ease: 'none', duration: 0.16 }, 0.86)

      tl.fromTo(headRef.current, { yPercent: 30, opacity: 0, filter: 'blur(12px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'apple', duration: 0.22 }, 0.04)

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
      <Chapter id="materials" length={2.6} darkness={0} background="#F7F5F2" onProgress={onProgress}>
        <div ref={wash} className="pointer-events-none absolute inset-0 bg-white opacity-0 will-move" />

        <div className="relative z-30 grid h-full grid-cols-1 gap-6 sm:gap-8 px-5 sm:px-6 py-8 sm:py-10 md:grid-cols-2 md:px-12 md:py-16">
          {/* Left — the specimen sits in the 3D layer behind this column */}
          <div className="flex flex-col justify-between">
            <span className="eyebrow text-ink/55">04 — Material Library</span>
            <h2 ref={headRef} className="display-md max-w-[12ch] text-ink will-move">
              Six ways
              <br />
              <span className="italic text-accent">to hold light.</span>
            </h2>
            <span className="eyebrow hidden text-ink/45 md:block">Specimen rotating — 360°</span>
          </div>

          {/* Right — the index */}
          <div ref={listRef} className="flex flex-col justify-center gap-0 self-center">
            {MATERIALS.map((m, i) => {
              const on = i === active
              return (
                <div
                  key={m.name}
                  className="will-move border-t border-ink/12 py-2.5 sm:py-3.5 md:py-5"
                  style={{
                    transition: 'opacity 1200ms var(--ease-subtle), transform 1200ms var(--ease-subtle)',
                    opacity: on ? 1 : 0.26,
                    transform: on ? 'translate3d(0,0,0)' : 'translate3d(-4px,0,0)',
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3 sm:gap-6">
                    <div className="flex items-baseline gap-2.5 sm:gap-4 md:gap-6">
                      <span className="eyebrow w-5 sm:w-6 shrink-0 text-ink/50">{String(i + 1).padStart(2, '0')}</span>
                      <h3
                        className="!text-[clamp(1.2rem,4.2vw,3.4rem)] font-display leading-none"
                        style={{
                          color: on ? '#151515' : '#151515',
                          transition: 'letter-spacing 1200ms var(--ease-subtle)',
                          letterSpacing: on ? '-0.03em' : '-0.04em',
                        }}
                      >
                        {m.name}
                      </h3>
                    </div>
                    <span
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 rounded-full ring-1 ring-ink/10"
                      style={{
                        background: m.hex,
                        transform: on ? 'scale(1)' : 'scale(0.6)',
                        transition: 'transform 1200ms var(--ease-subtle)',
                      }}
                    />
                  </div>
                  <div
                    className="grid overflow-hidden will-move"
                    style={{
                      gridTemplateRows: on ? '1fr' : '0fr',
                      transition: 'grid-template-rows 1200ms var(--ease-subtle)',
                      willChange: 'grid-template-rows',
                    }}
                  >
                    <div className="min-h-0">
                      <p className="body-sm ml-7 sm:ml-10 pt-1.5 sm:pt-2 text-ink/60 md:ml-[3.1rem]">
                        {m.note} <span className="text-ink/50">— {m.origin}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="border-t border-ink/12" />
          </div>
        </div>
      </Chapter>
    </div>
  )
}
