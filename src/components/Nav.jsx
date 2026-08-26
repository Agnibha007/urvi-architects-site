import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { scrollStore } from '@/hooks/useScrollStore'

const CHAPTERS = [
  ['hero', 'Studio'],
  ['living', 'Selected'],
  ['kitchen', 'Penthouse'],
  ['bedroom', 'Villa'],
  ['materials', 'Materials'],
  ['blueprint', 'Process'],
  ['finale', 'Vision'],
  ['contact', 'Contact'],
]

/**
 * Minimal editorial navigation: URVI wordmark left, MENU right.
 *
 * All of it inverts on the dark chapters. The inversion is driven by
 * scrollStore.darkness in a RAF loop and applied as a CSS custom property.
 */
export default function Nav() {
  const root = useRef(null)
  const bar = useRef(null)
  const [active, setActive] = useState('hero')
  const lastSection = useRef('hero')
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
    window.__lenis
      ? window.__lenis.scrollTo(`#${id}`, { duration: 3.2 })
      : document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Find the current chapter index for the progress indicator
  const activeIdx = CHAPTERS.findIndex(([id]) => id === active)
  const chapterNum = String(activeIdx + 1).padStart(2, '0')

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-50" style={{ '--chrome': '#151515' }}>
      {/* Skip link for keyboard accessibility */}
      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-bone focus:px-4 focus:py-2 focus:text-ink focus:underline"
        onClick={(e) => { e.preventDefault(); go('contact') }}
      >
        Skip to contact
      </a>

      {/* Wordmark — left */}
      <button
        onClick={() => go('hero')}
        className="pointer-events-auto absolute left-4 top-4 sm:left-6 sm:top-6 md:left-12 md:top-8"
        style={{ color: 'var(--chrome)', transition: 'color 1200ms var(--ease-subtle)' }}
        aria-label="URVI — Return to top"
      >
        <span className="font-display text-[14px] sm:text-[16px] md:text-[18px] leading-none tracking-editorial">
          URVI
        </span>
      </button>

      {/* MENU — right, toggleable on mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="pointer-events-auto absolute right-4 top-4 sm:right-6 sm:top-6 md:right-12 md:top-8 font-sans text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-micro"
        style={{ color: 'var(--chrome)', transition: 'color 1200ms var(--ease-subtle)' }}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        {menuOpen ? 'Close' : 'Menu'}
      </button>

      {/* Chapter progress — subtle indicator */}
      <div
        className="absolute left-4 sm:left-6 md:left-12 top-16 sm:top-20 md:top-24 font-sans text-[9px] uppercase tracking-micro hidden md:block"
        style={{ color: 'var(--chrome-dim)', transition: 'color 1200ms var(--ease-subtle)' }}
      >
        {chapterNum} / {String(CHAPTERS.length).padStart(2, '0')}
      </div>

      {/* Chapter index — desktop side nav + mobile overlay */}
      <nav
        className={`pointer-events-auto absolute right-0 top-0 h-full w-full md:w-auto md:bg-transparent flex flex-col items-end justify-center gap-0 transition-opacity duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:h-auto md:static md:translate-y-0 md:flex-col'
        }`}
        style={{
          background: menuOpen ? 'rgba(247,245,242,0.97)' : 'transparent',
          backdropFilter: menuOpen ? 'blur(20px)' : 'none',
        }}
      >
        <div className="flex flex-col items-end gap-0 md:absolute md:right-12 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-0">
          {CHAPTERS.map(([id, label]) => {
            const on = active === id
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className="group flex items-center gap-3 py-2 md:py-2 px-6 md:px-0"
                style={{ color: menuOpen ? '#151515' : 'var(--chrome)' }}
                aria-label={`Navigate to ${label}`}
                aria-current={on ? 'true' : undefined}
              >
                <span
                  className="font-sans text-[10px] uppercase tracking-micro transition-all duration-700"
                  style={{
                    opacity: on ? 0.9 : menuOpen ? 0.4 : 0,
                    transform: on ? 'translateX(0)' : 'translateX(3px)',
                  }}
                >
                  {label}
                </span>
                <span
                  className="block h-[1px] bg-current transition-all duration-700"
                  style={{
                    width: on ? 28 : 12,
                    opacity: on ? 0.9 : 0.28,
                  }}
                />
              </button>
            )
          })}
        </div>
      </nav>

      {/* Progress hairline */}
      <div className="absolute inset-x-0 bottom-0 h-[1px]">
        <div
          ref={bar}
          className="h-full w-full origin-left bg-accent will-move"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}
