import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Global normalised pointer, damped. Written to a ref (never state) so moving
 * the mouse cannot trigger a React render anywhere in the tree — consumers read
 * `.current` inside their own RAF/useFrame loop.
 *
 * x, y  → -1..1 damped        rx, ry → -1..1 raw
 */
const pointer = { x: 0, y: 0, rx: 0, ry: 0, active: false }

let bound = false

function bind() {
  if (bound || typeof window === 'undefined') return
  bound = true

  const onMove = (e) => {
    pointer.rx = (e.clientX / window.innerWidth) * 2 - 1
    pointer.ry = (e.clientY / window.innerHeight) * 2 - 1
    pointer.active = true
  }
  const onLeave = () => {
    pointer.active = false
    pointer.rx = 0
    pointer.ry = 0
  }
  const onTouchEnd = () => {
    // Mobile: pointerleave never fires on finger lift. Reset after a short
    // delay so parallax has time to damp back to center.
    setTimeout(() => {
      pointer.active = false
      pointer.rx = 0
      pointer.ry = 0
    }, 180)
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerleave', onLeave, { passive: true })
  window.addEventListener('pointercancel', onLeave, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })

  // Critically damped follow — the "expensive" feel comes from the lag.
  gsap.ticker.add(() => {
    pointer.x += (pointer.rx - pointer.x) * 0.055
    pointer.y += (pointer.ry - pointer.y) * 0.055
  })
}

export function usePointer() {
  const ref = useRef(pointer)
  useEffect(bind, [])
  return ref
}

export { pointer }
