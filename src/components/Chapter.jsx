import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { reportSection } from '@/hooks/useScrollStore'

/**
 * A pinned chapter of the film.
 *
 * Pinning is done with `pinSpacing: true` and a fixed-height inner stage, so
 * the browser never reflows during the pin — the stage is a single composited
 * layer that the scroll distance simply plays across.
 *
 * `darkness` cross-fades the page background AND the 3D lighting, which is what
 * makes the light→dark chapters feel like the sun setting rather than a theme swap.
 */
export default function Chapter({
  id,
  children,
  length = 2.4, // multiples of viewport height of scroll distance
  darkness = 0,
  background,
  className = '',
  stageClassName = '',
  onProgress,
  pin = true,
}) {
  const root = useRef(null)
  const stage = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        desktop: '(min-width: 768px)',
        mobile: '(max-width: 767px)',
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { mobile, reduced } = ctx.conditions
        // Mobile gets shorter pins so the story doesn't feel like wading.
        const scale = reduced ? 0.35 : mobile ? 0.62 : 1

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * length * scale}`,
          pin: pin ? stage.current : false,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            reportSection(id, self.progress, darkness)
            onProgress?.(self.progress, self)
          },
          onEnter: () => reportSection(id, 0, darkness),
          onEnterBack: () => reportSection(id, 1, darkness),
        })

        return () => st.kill()
      }
    )

    return () => mm.revert()
  }, [id, length, darkness, pin, onProgress])

  return (
    <section
      ref={root}
      id={id}
      data-chapter={id}
      className={`relative ${className}`}
      style={{ background }}
    >
      <div
        ref={stage}
        className={`relative h-[100svh] w-full overflow-hidden ${stageClassName}`}
        style={{ contain: 'layout paint' }}
      >
        {children}
      </div>
    </section>
  )
}
