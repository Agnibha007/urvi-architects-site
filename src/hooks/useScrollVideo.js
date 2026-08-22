import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Scroll-scrubbed video.
 *
 * Three problems this solves, which naive `video.currentTime = progress * duration`
 * inside onUpdate does not:
 *
 *  1. SEEK STORMS. Setting currentTime faster than the decoder can serve frames
 *     queues seeks and the element stalls. We keep a target value and commit it
 *     at most once per frame, and only when the previous seek has resolved.
 *  2. SUB-FRAME THRASH. Requests are quantised to the source frame grid (24fps),
 *     so micro-scrolls don't trigger decodes that produce an identical picture.
 *  3. COLD START. The element is not given a src until it approaches the viewport,
 *     then it is primed to frame 0 and held there — so the first scroll pixel
 *     already has a decoded frame to show.
 */
export function useScrollVideo({
  src,
  fps = 24,
  // Portion of the pinned scroll distance the clip is scrubbed across.
  range = [0, 1],
  trigger,
  start = 'top top',
  end = 'bottom bottom',
  scrub = true,
  eager = false,
  onProgress,
} = {}) {
  const videoRef = useRef(null)
  const state = useRef({ target: 0, applied: -1, seeking: false, ready: false })

  // start/end are frequently passed as inline arrow functions. Holding them in a
  // ref keeps them out of the dependency array — otherwise every parent render
  // would tear down the ScrollTrigger AND drop the video source, forcing a refetch.
  const cfg = useRef({ start, end, range, trigger, onProgress })
  cfg.current = { start, end, range, trigger, onProgress }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const s = state.current
    const frame = 1 / fps

    /* ---- lazy attach ------------------------------------------------ */
    const attach = () => {
      if (video.dataset.attached) return
      video.dataset.attached = '1'
      video.src = src
      video.load()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attach()
          io.disconnect()
        }
      },
      // Start fetching early so video is decoded before it is seen.
      // Smaller margin on mobile to avoid unnecessary downloads on slow connections.
      { rootMargin: window.innerWidth < 768 ? '60% 0px 60% 0px' : '120% 0px 120% 0px' }
    )

    if (eager) attach()
    else io.observe(video)

    const onLoaded = () => {
      s.ready = true
      // Prime frame 0 so the poster frame is real video, not a black flash.
      try {
        video.currentTime = 0.001
      } catch {
        /* noop */
      }
    }
    const onSeeked = () => {
      s.seeking = false
    }

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('seeked', onSeeked)

    /* ---- commit loop: one seek per frame, max ----------------------- */
    const commit = () => {
      if (!s.ready || s.seeking) return
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) return

      // Quantise to the source frame grid.
      const wanted = Math.min(duration - frame, Math.max(0, Math.round(s.target * duration / frame) * frame))
      if (Math.abs(wanted - s.applied) < frame * 0.5) return

      s.applied = wanted
      s.seeking = true
      video.currentTime = wanted
    }

    gsap.ticker.add(commit)

    /* ---- scroll binding --------------------------------------------- */
    const [rIn, rOut] = cfg.current.range
    const span = rOut - rIn

    const st = ScrollTrigger.create({
      trigger: cfg.current.trigger?.current ?? video.parentElement,
      start: cfg.current.start,
      end: cfg.current.end,
      scrub,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = gsap.utils.clamp(0, 1, (self.progress - rIn) / span)
        s.target = p
        cfg.current.onProgress?.(p, self)
      },
    })

    return () => {
      gsap.ticker.remove(commit)
      st.kill()
      io.disconnect()
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('seeked', onSeeked)
      video.removeAttribute('src')
      // Must clear the guard too. React StrictMode mounts → unmounts → remounts
      // in development; without this reset the second mount sees `attached` still
      // set, skips attach(), and the video silently never gets a source again.
      delete video.dataset.attached
      s.ready = false
      s.applied = -1
      s.seeking = false
      video.load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fps, scrub, eager])

  return videoRef
}
