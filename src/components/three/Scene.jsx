import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { scrollStore } from '@/hooks/useScrollStore'
import { pointer } from '@/hooks/usePointer'
import { MarbleSphere, BrassRing, MaterialCube, GlassPlane, WireframeVilla, LightParticles } from './Objects'

/**
 * ONE camera for the whole film.
 *
 * Each chapter declares a dolly position; the camera damps toward whichever
 * chapter is active, so section changes read as a continuous camera move
 * rather than a cut. The reader never sees a transition begin.
 */
const SHOTS = {
  hero: { pos: [0, 0, 7.2], look: [0, 0, 0], fov: 42 },
  living: { pos: [1.1, 0.3, 6.4], look: [0.2, 0, 0], fov: 40 },
  kitchen: { pos: [-1.2, -0.2, 5.6], look: [-0.1, 0, 0], fov: 38 },
  bedroom: { pos: [0.4, 0.6, 6.8], look: [0, 0.1, 0], fov: 44 },
  materials: { pos: [0, 0, 4.9], look: [0, 0, 0], fov: 36 },
  blueprint: { pos: [0.2, 0.9, 6.0], look: [0, -0.1, 0], fov: 40 },
  finale: { pos: [0, 0, 8.0], look: [0, 0, 0], fov: 46 },
  contact: { pos: [0, -0.4, 9.0], look: [0, 0, 0], fov: 48 },
}

function CameraRig({ reducedRef }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const _lookTarget = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    const shot = SHOTS[scrollStore.section] ?? SHOTS.hero
    const amp = reducedRef.current ? 0.2 : 1

    // Chapter dolly + a very subtle continuous push driven by progress within it.
    // Pointer parallax is restrained — just enough to feel alive, not distracting.
    target.current.set(
      shot.pos[0] + pointer.x * 0.22 * amp,
      shot.pos[1] - pointer.y * 0.16 * amp,
      shot.pos[2] - scrollStore.local * 0.45 * amp
    )

    // Slower damping for more deliberate, expensive-feeling camera moves.
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, 1.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, 1.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, 1.2, dt)

    _lookTarget.current.set(...shot.look)
    look.current.lerp(_lookTarget.current, 1 - Math.exp(-1.4 * dt))
    camera.lookAt(look.current)

    const fov = THREE.MathUtils.damp(camera.fov, shot.fov, 1.2, dt)
    if (Math.abs(fov - camera.fov) > 0.001) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

/**
 * Chapter gate. An object belongs to one or more chapters; outside them it
 * scales to zero and stops rendering. Because the scale is damped, objects
 * "arrive" and "withdraw" rather than pop — and `visible=false` means the
 * whole subtree is skipped by the renderer once it's fully gone.
 */
function Gate({ chapters, children, restScale = 0.0001 }) {
  const g = useRef()
  const v = useRef(0)

  useFrame((_, dt) => {
    const want = chapters.includes(scrollStore.section) ? 1 : 0
    v.current = THREE.MathUtils.damp(v.current, want, 2.6, dt)
    const s = Math.max(restScale, v.current)
    g.current.scale.setScalar(s)
    g.current.visible = v.current > 0.008
  })

  return <group ref={g}>{children}</group>
}

/** Cheap volumetric shafts — two very large, very soft planes. Restrained pointer interaction. */
function LightShafts() {
  const g = useRef()
  useFrame((_, dt) => {
    g.current.rotation.z = THREE.MathUtils.damp(g.current.rotation.z, 0.28 + pointer.x * 0.025, 0.9, dt)
    g.current.material.opacity = THREE.MathUtils.damp(g.current.material.opacity, 0.04 + scrollStore.darkness * 0.08, 1.5, dt)
  })
  return (
    <mesh ref={g} position={[-2.6, 1.4, -4]} rotation={[0, 0, 0.28]}>
      <planeGeometry args={[3.2, 16]} />
      <meshBasicMaterial color="#F6E9D2" transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function useMediaFlags() {
  const reducedRef = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const mobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMQ = () => { reducedRef.current = mq.matches }
    mq.addEventListener('change', onMQ)

    const onResize = () => { mobileRef.current = window.innerWidth < 768 }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      mq.removeEventListener('change', onMQ)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return { reduced: reducedRef, mobile: mobileRef }
}

export default function Scene({ cubeColorRef, buildRef }) {
  const { reduced: reducedRef, mobile: mobileRef } = useMediaFlags()

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, mobileRef.current ? 1.5 : 2]}
        gl={{
          antialias: !mobileRef.current,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 7.2], fov: 42, near: 0.1, far: 60 }}
        // Frameloop stays 'always' — the objects breathe even when scroll is idle,
        // but every object is GPU-animated so the CPU cost per frame is ~0.
        frameloop="always"
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <CameraRig reducedRef={reducedRef} />

        <Suspense fallback={null}>
          {/* Chapter-anchored objects. They live at fixed world positions;
              the camera is what moves between them. */}
          <Gate chapters={['hero', 'living', 'kitchen', 'bedroom', 'finale', 'contact']}>
            <MarbleSphere position={[3.1, 0.7, -1.4]} scale={0.62} phase={0} />
          </Gate>

          <Gate chapters={['hero', 'kitchen', 'bedroom', 'materials', 'finale', 'contact']}>
            <BrassRing position={[-3.3, -0.9, -0.6]} scale={0.78} phase={1.4} />
          </Gate>

          <Gate chapters={['living', 'kitchen', 'bedroom', 'finale']}>
            <GlassPlane position={[2.4, -1.5, -2.6]} rotation={[0.08, -0.45, 0.06]} size={[1.7, 2.4]} phase={2.1} />
            <GlassPlane position={[-2.1, 1.6, -3.4]} rotation={[-0.1, 0.5, -0.08]} size={[1.3, 1.9]} phase={0.6} />
          </Gate>

          <Gate chapters={['materials']}>
            <MaterialCube position={[0, 0, 0.4]} scale={0.86} colorRef={cubeColorRef} />
          </Gate>

          <Gate chapters={['blueprint']}>
            <WireframeVilla position={[0, -0.35, -1.2]} scale={0.72} buildRef={buildRef} />
          </Gate>

          {!mobileRef.current && <LightParticles count={reducedRef.current ? 120 : 420} />}
          <LightShafts />

          <Preload all />
        </Suspense>

        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
      </Canvas>
    </div>
  )
}
