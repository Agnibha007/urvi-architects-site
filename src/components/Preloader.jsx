import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { VIDEOS } from '@/lib/assets'

/**
 * The overture — refined editorial preloader.
 *
 * Nothing scrolls until the first clip has enough data to scrub. The preloader
 * establishes the typographic world of URVI: large serif counter, minimal
 * studio label, clean progress bar. The curtain lift is the first camera move.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null)
  const counter = useRef(null)
  const bar = useRef(null)
  const word = useRef(null)
  const studioLabel = useRef(null)
  const [n, setN] = useState(0)
  const exitedRef = useRef(false)
  const tlRef = useRef(null)

  // Real readiness: the hero clip must be buffered enough to seek.
  useEffect(() => {
    let raf
    let settled = false
    const started = performance.now()

    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'auto'
    v.src = VIDEOS.heroChair

    const progress = () => {
      const elapsed = (performance.now() - started) / 1000
      let buffered = 0
      try {
        if (v.buffered.length && v.duration) buffered = v.buffered.end(0) / v.duration
      } catch {
        /* noop */
      }
      const floor = Math.min(0.92, elapsed / 3.4)
      const p = Math.max(floor, buffered)
      setN(Math.round(Math.min(1, p) * 100))

      if (!settled && (v.readyState >= 3 || elapsed > 7)) {
        settled = true
        setN(100)
        cancelAnimationFrame(raf)
        setTimeout(exit, 520)
        return
      }
      raf = requestAnimationFrame(progress)
    }

    v.load()
    raf = requestAnimationFrame(progress)

    const exit = () => {
      if (exitedRef.current) return
      exitedRef.current = true

      const tl = gsap.timeline({
        onComplete: () => {
          onDone?.()
        },
      })

      tlRef.current = tl

      tl.to([counter.current, word.current, bar.current, studioLabel.current], {
        yPercent: -120,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: 'apple',
      })
        .to(
          root.current,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.5, ease: 'apple' },
          '-=0.65'
        )
    }

    return () => {
      cancelAnimationFrame(raf)
      tlRef.current?.kill()
      v.removeAttribute('src')
      v.load()
    }
  }, [onDone])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [word.current, counter.current],
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.1, ease: 'apple' }
      )
      gsap.fromTo(
        studioLabel.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, delay: 0.3, ease: 'power1.out' }
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-bone px-6 py-8 md:px-12 md:py-12"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div ref={studioLabel} className="will-move">
        <p className="eyebrow text-ink/35">
          Andhra Pradesh &amp; Telangana — India
        </p>
      </div>

      <div className="flex items-end justify-between gap-6">
        <div className="line-mask">
          <span
            ref={counter}
            className="font-display leading-none tracking-tightest text-ink will-move"
            style={{ fontSize: 'clamp(4rem, 17vw, 17rem)', fontVariantNumeric: 'tabular-nums' }}
          >
            {String(n).padStart(3, '0')}
          </span>
        </div>
        <span className="eyebrow mb-4 text-ink/20 md:mb-8">%</span>
      </div>

      <div>
        <div className="line-mask mb-3">
          <p ref={word} className="font-display text-[14px] sm:text-[16px] md:text-[18px] tracking-editorial text-ink will-move">
            URVI
          </p>
        </div>
        <div ref={bar} className="h-[1px] w-full bg-ink/8 will-move">
          <div
            className="h-full origin-left bg-accent"
            style={{ transform: `scaleX(${n / 100})`, transition: 'transform 600ms var(--ease-subtle)' }}
          />
        </div>
      </div>
    </div>
  )
}
