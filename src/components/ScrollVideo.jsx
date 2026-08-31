import { forwardRef } from 'react'
import { useScrollVideo } from '@/hooks/useScrollVideo'
import { VIDEO_FPS } from '@/lib/assets'

/**
 * A <video> that renders the canonical master-timeline state for its section.
 *
 * Elements mount with `preload="none"`; the master timeline pulls in the src
 * (via load) as soon as the video becomes the predicted next section, and
 * warms the decoder before it becomes active. Nothing here ever drives scroll.
 *
 * The `sectionId` tells the master timeline which section owns this video so
 * its desired frame is computed from that section's canonical progress.
 */
const ScrollVideo = forwardRef(function ScrollVideo(
  {
    src,
    sectionId,
    range,
    eager = false,
    fps = VIDEO_FPS,
    className = '',
    style,
    poster,
    fit = 'cover',
  },
  _outer
) {
  const ref = useScrollVideo({ src, sectionId, range, fps })

  return (
    <video
      ref={ref}
      data-eager={eager ? '1' : undefined}
      poster={poster}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      className={`will-move ${className}`}
      style={{
        objectFit: fit,
        // Promote to its own compositor layer; decoded frames are then
        // blitted, never repainted with the rest of the page.
        transform: 'translateZ(0)',
        ...style,
      }}
    />
  )
})

export default ScrollVideo
