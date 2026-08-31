import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Generic scroll reveal. Nothing in this project appears — everything arrives.
 *
 * variants:
 *  'rise'   — translate up + fade + de-blur
 *  'clip'   — clip-path wipe (image masking)
 *  'scale'  — scale-from-0.92 with perspective
 *  'lines'  — children fade in sequentially, line by line
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  variant = 'rise',
  delay = 0,
  duration = 1.6,
  stagger = 0.12,
  distance = 46,
  from = 'bottom',
  start = 'top 85%',
  scrub = false,
  style,
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const targets = variant === 'lines' ? el.children : el

      const base = {
        rise: { y: distance, opacity: 0, filter: 'blur(6px)' },
        lines: { y: distance * 0.6, opacity: 0, filter: 'blur(4px)' },
        scale: { scale: 0.92, opacity: 0, filter: 'blur(6px)' },
        clip: {
          clipPath:
            from === 'left'
              ? 'inset(0% 100% 0% 0%)'
              : from === 'right'
                ? 'inset(0% 0% 0% 100%)'
                : 'inset(100% 0% 0% 0%)',
        },
      }[variant]

      const to = {
        rise: { y: 0, opacity: 1, filter: 'blur(0px)' },
        lines: { y: 0, opacity: 1, filter: 'blur(0px)' },
        scale: { scale: 1, opacity: 1, filter: 'blur(0px)' },
        clip: { clipPath: 'inset(0% 0% 0% 0%)' },
      }[variant]

      gsap.set(targets, base)
      gsap.to(targets, {
        ...to,
        duration,
        delay,
        ease: 'apple',
        stagger: variant === 'lines' ? stagger : 0,
        scrollTrigger: {
          trigger: el,
          start,
          end: scrub ? 'bottom 45%' : undefined,
          scrub: scrub ? 0.7 : false,
          once: !scrub,
          invalidateOnRefresh: true,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [variant, delay, duration, stagger, distance, from, start, scrub])

  return (
    <Tag ref={ref} className={`will-move ${className}`} style={style}>
      {children}
    </Tag>
  )
}
