import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { VIDEOS } from '@/lib/assets'

/**
 * The overture.
 *
 * Nothing scrolls until the first clip has enough data to scrub. Rather than a
 * spinner, the count itself is the composition — it holds the reader in the
 * film's typographic world before a single frame appears, and the curtain lift
 * is the first camera move.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null)
  const counter = useRef(null)
  const bar = useRef(null)
  const word = useRef(null)
  const [n, setN] = useState(0)

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
      // Blend real buffer progress with a floor so it never stalls at 0.
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
        // Hold the 100 for a beat — the pause is what makes it feel deliberate.
        setTimeout(exit, 520)
        return
      }
      raf = requestAnimationFrame(progress)
    }

    v.load()
    raf = requestAnimationFrame(progress)

    const exit = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          onDone?.()
          root.current?.remove()
        },
      })

      tl.to([counter.current, word.current, bar.current], {
        yPercent: -120,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: 'apple',
      })
        // Curtain lifts as a clip, not a fade — the page is revealed, not faded in.
        .to(
          root.current,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.5, ease: 'apple' },
          '-=0.65'
        )
    }

    return () => {
      cancelAnimationFrame(raf)
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
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-bone px-6 py-8 md:px-12 md:py-12"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div className="line-mask">
        <p ref={word} className="eyebrow text-ink/45 will-move">
          Urvi Architects — Loading the film
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
        <span className="eyebrow mb-4 text-ink/30 md:mb-8">%</span>
      </div>

      <div ref={bar} className="h-[1.5px] w-full bg-ink/10 will-move">
        <div
          className="h-full origin-left bg-accent"
          style={{ transform: `scaleX(${n / 100})`, transition: 'transform 400ms var(--ease-apple)' }}
        />
      </div>
    </div>
  )
}
