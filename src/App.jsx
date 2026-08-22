import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { useLenis } from '@/hooks/useLenis'
import { usePointer } from '@/hooks/usePointer'
import { useScrollStore } from '@/hooks/useScrollStore'

import Preloader from '@/components/Preloader'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import LivingRoom from '@/sections/LivingRoom'
import Kitchen from '@/sections/Kitchen'
import Bedroom from '@/sections/Bedroom'
import Materials from '@/sections/Materials'
import Blueprint from '@/sections/Blueprint'
import Finale from '@/sections/Finale'
import Contact from '@/sections/Contact'

// Three.js is ~600KB — it must never block the first frame of the film.
const Scene = lazy(() => import('@/components/three/Scene'))

export default function App() {
  const [ready, setReady] = useState(false)
  const [showScene, setShowScene] = useState(false)

  // Cross-layer channels: DOM sections write, the 3D scene reads. Refs, not
  // state, so a scroll frame can never schedule a React render.
  const cubeColorRef = useRef('#EDEAE4')
  const buildRef = useRef(0)

  usePointer()
  useScrollStore()
  useLenis()

  const onLoaded = useCallback(() => {
    setReady(true)
    // Give the browser one idle slot to settle layout before measuring pins.
    requestAnimationFrame(() => ScrollTrigger.refresh())
    // The canvas mounts after the curtain — the opening should never compete
    // with WebGL context creation for the main thread.
    const id = window.setTimeout(() => setShowScene(true), 900)
    return () => window.clearTimeout(id)
  }, [])

  // Lock scroll until the overture ends.
  useEffect(() => {
    document.documentElement.style.overflow = ready ? '' : 'hidden'
    document.body.style.overflow = ready ? '' : 'hidden'
    // iOS Safari needs position: fixed to truly lock scroll during preloader
    if (!ready) {
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.position = ''
      document.body.style.width = ''
    }
    if (ready) window.__lenis?.start()
    else window.__lenis?.stop()
  }, [ready])

  // Re-measure after fonts land — otherwise every pin is computed against
  // fallback metrics and the whole film sits a few hundred pixels out.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('orientationchange', onResize)
    return () => window.removeEventListener('orientationchange', onResize)
  }, [])

  return (
    <div className="grain relative">
      {!ready && <Preloader onDone={onLoaded} />}

      <Nav />

      {showScene && (
        <Suspense fallback={null}>
          <Scene cubeColorRef={cubeColorRef} buildRef={buildRef} />
        </Suspense>
      )}

      <main className="relative z-30">
        <Hero />
        <LivingRoom />
        <Kitchen />
        <Bedroom />
        <Materials cubeColorRef={cubeColorRef} />
        <Blueprint buildRef={buildRef} />
        <Finale />
        <Contact />
      </main>
    </div>
  )
}
