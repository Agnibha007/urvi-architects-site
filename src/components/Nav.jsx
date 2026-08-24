import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { scrollStore } from '@/hooks/useScrollStore'

const CHAPTERS = [
  ['hero', 'Opening'],
  ['living', 'Living'],
  ['kitchen', 'Kitchen'],
  ['bedroom', 'Bedroom'],
  ['materials', 'Material'],
  ['blueprint', 'Drawing'],
  ['finale', 'Villa'],
  ['contact', 'Studio'],
]

/**
 * Fixed chrome: wordmark, chapter index, progress hairline.
 *
 * All of it inverts on the dark chapters. The inversion is driven by
 * scrollStore.darkness in a RAF loop and applied as a CSS custom property, so
 * the whole chrome recolours with a single style write per frame instead of
 * eight React re-renders.
 */
export default function Nav() {
  const root = useRef(null)
  const bar = useRef(null)
  const [active, setActive] = useState('hero')
  const lastSection = useRef('hero')

  useEffect(() => {
    const tick = () => {
      // Recolour
      const d = scrollStore.darkness
      root.current?.style.setProperty('--chrome', d > 0.55 ? '#F0F4F5' : '#151515')
      root.current?.style.setProperty('--chrome-dim', d > 0.55 ? 'rgba(240,244,245,0.4)' : 'rgba(21,21,21,0.4)')

      // Progress hairline
      if (bar.current) bar.current.style.transform = `scaleX(${scrollStore.global})`

      // Only re-render when the chapter actually changes.
      if (scrollStore.section !== lastSection.current) {
        lastSection.current = scrollStore.section
        setActive(scrollStore.section)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const go = (id) => {
    window.__lenis
      ? window.__lenis.scrollTo(`#${id}`, { duration: 2.4 })
      : document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-50" style={{ '--chrome': '#151515' }}>
      {/* Wordmark */}
      <button
        onClick={() => go('hero')}
        className="pointer-events-auto absolute left-4 top-4 sm:left-6 sm:top-6 md:left-12 md:top-8"
        style={{ color: 'var(--chrome)', transition: 'color 1200ms var(--ease-subtle)' }}
      >
        <span className="font-display text-[13px] sm:text-[15px] md:text-[17px] leading-none tracking-[0.14em]">
          URVI
        </span>
        <span className="ml-1.5 sm:ml-2 font-sans text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-micro opacity-50">
          Architects
        </span>
      </button>

      {/* Chapter index — desktop only, this is a reading aid not navigation */}
      <nav className="pointer-events-auto absolute right-12 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
        {CHAPTERS.map(([id, label]) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => go(id)}
              className="group flex items-center gap-3"
              style={{ color: 'var(--chrome)' }}
            >
              <span
                className="font-sans text-[10px] uppercase tracking-micro"
                style={{
                  opacity: on ? 0.9 : 0,
                  transform: on ? 'translateX(0)' : 'translateX(3px)',
                  transition: 'opacity 1000ms var(--ease-subtle), transform 1000ms var(--ease-subtle)',
                }}
              >
                {label}
              </span>
              <span
                className="block h-[1px] bg-current"
                style={{
                  width: on ? 32 : 16,
                  opacity: on ? 0.9 : 0.28,
                  transition: 'width 1200ms var(--ease-subtle), opacity 1200ms var(--ease-subtle)',
                }}
              />
            </button>
          )
        })}
      </nav>

      {/* Enquiry — safe area padding on mobile */}
      <a
        href="#contact"
        onClick={(e) => {
          e.preventDefault()
          go('contact')
        }}
        className="pointer-events-auto absolute right-4 top-4 sm:right-6 sm:top-6 md:right-12 md:top-8 font-sans text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-micro"
        style={{ color: 'var(--chrome)', transition: 'color 1200ms var(--ease-subtle)' }}
      >
        Enquire
      </a>

      {/* Progress hairline */}
      <div className="absolute inset-x-0 bottom-0 h-[1.5px]">
        <div
          ref={bar}
          className="h-full w-full origin-left bg-accent will-move"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}
