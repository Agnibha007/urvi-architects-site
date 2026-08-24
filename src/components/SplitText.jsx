import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Free-standing SplitText (no GSAP Club plugin needed).
 *
 * Splits into words → chars, each char wrapped in an overflow-hidden mask so the
 * reveal is a true clip, not an opacity fade. Words are kept intact as inline-block
 * so wrapping stays typographically correct at any viewport.
 *
 * Only `transform` and `opacity` are animated. Nothing here can cause layout.
 */
export default function SplitText({
  children,
  as: Tag = 'span',
  className = '',
  by = 'char', // 'char' | 'word' | 'line'
  stagger = 0.028,
  duration = 1.3,
  y = '110%',
  rotate = 0,
  blur = false,
  start = 'top 82%',
  scrub = false,
  delay = 0,
  once = true,
  trigger,
}) {
  const root = useRef(null)

  const parts = useMemo(() => {
    const text = String(children ?? '')
    return text.split(/(\s+)/).filter((s) => s.length)
  }, [children])

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const targets = el.querySelectorAll('[data-split-unit]')
    if (!targets.length) return

    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: parseFloat(y), rotate, opacity: blur ? 0 : 1, ...(blur && { filter: 'blur(8px)' }) })

      gsap.to(targets, {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        ...(blur && { filter: 'blur(0px)' }),
        duration,
        delay,
        stagger: { each: stagger, from: 'start' },
        ease: 'apple',
        scrollTrigger: {
          trigger: trigger?.current ?? el,
          start,
          end: scrub ? 'bottom 40%' : undefined,
          scrub: scrub ? 0.7 : false,
          once: once && !scrub,
          invalidateOnRefresh: true,
        },
      })
    }, el)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [parts, by, stagger, duration, y, rotate, blur, start, scrub, delay, once, trigger])

  return (
    <Tag ref={root} className={className} style={{ display: 'inline-block' }}>
      {parts.map((chunk, i) => {
        if (/^\s+$/.test(chunk)) return <span key={i}> </span>

        if (by === 'word' || by === 'line') {
          return (
            <span key={i} className="line-mask" style={{ display: 'inline-block', verticalAlign: 'bottom' }}>
              <span data-split-unit className="will-move" style={{ display: 'inline-block' }}>
                {chunk}
              </span>
            </span>
          )
        }

        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {Array.from(chunk).map((ch, j) => (
              <span key={j} className="line-mask" style={{ display: 'inline-block', verticalAlign: 'bottom' }}>
                <span data-split-unit className="will-move" style={{ display: 'inline-block' }}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
        )
      })}
    </Tag>
  )
}
