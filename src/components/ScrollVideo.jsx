import { forwardRef } from 'react'
import { useScrollVideo } from '@/hooks/useScrollVideo'
import { VIDEO_FPS } from '@/lib/assets'

/**
 * A <video> that plays only when scrolled. Never autoplays, never has audio,
 * never lays out — it is a fixed GPU layer inside its pinned parent.
 */
const ScrollVideo = forwardRef(function ScrollVideo(
  {
    src,
    trigger,
    range,
    start,
    end,
    eager = false,
    fps = VIDEO_FPS,
    onProgress,
    className = '',
    style,
    poster,
    fit = 'cover',
  },
  _outer
) {
  const ref = useScrollVideo({ src, trigger, range, start, end, eager, fps, onProgress })

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      playsInline
      preload={eager ? 'auto' : 'none'}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      className={`will-move ${className}`}
      style={{
        objectFit: fit,
        // Promote to its own compositor layer; decoded frames are then blitted,
        // never repainted with the rest of the page.
        transform: 'translateZ(0)',
        ...style,
      }}
    />
  )
})

export default ScrollVideo
