import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '@/hooks/usePointer'
import { scrollStore } from '@/hooks/useScrollStore'
import { MarbleMaterial, BrassMaterial, GlassMaterial, BlueprintMaterial } from './shaders'

/* Shared damping helper — everything moves late, never instantly. */
const damp = (cur, target, lambda, dt) => THREE.MathUtils.damp(cur, target, lambda, dt)

/* ================================================================== */
export function MarbleSphere({ position = [0, 0, 0], scale = 1, phase = 0 }) {
  const mesh = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({ ...MarbleMaterial, uniforms: THREE.UniformsUtils.clone(MarbleMaterial.uniforms) }), [])

  useFrame((_, dt) => {
    const t = performance.now() / 1000
    mat.uniforms.uTime.value = t
    mat.uniforms.uDark.value = damp(mat.uniforms.uDark.value, scrollStore.darkness, 2.5, dt)

    const m = mesh.current
    // Slow tumble + very small pointer parallax. Never more than a few degrees.
    m.rotation.y += dt * 0.075
    m.rotation.x = damp(m.rotation.x, pointer.y * 0.10, 1.6, dt)
    m.position.x = damp(m.position.x, position[0] + pointer.x * 0.22, 1.4, dt)
    m.position.y = damp(m.position.y, position[1] + Math.sin(t * 0.5 + phase) * 0.14 - pointer.y * 0.14, 1.4, dt)
  })

  return (
    <mesh ref={mesh} position={position} scale={scale} material={mat}>
      <sphereGeometry args={[1, 96, 96]} />
    </mesh>
  )
}

/* ================================================================== */
export function BrassRing({ position = [0, 0, 0], scale = 1, phase = 1.2 }) {
  const mesh = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({ ...BrassMaterial, uniforms: THREE.UniformsUtils.clone(BrassMaterial.uniforms) }), [])

  useFrame((_, dt) => {
    const t = performance.now() / 1000
    mat.uniforms.uTime.value = t
    mat.uniforms.uDark.value = damp(mat.uniforms.uDark.value, scrollStore.darkness, 2.5, dt)

    const m = mesh.current
    m.rotation.z += dt * 0.11
    m.rotation.x = damp(m.rotation.x, 0.85 + pointer.y * 0.14, 1.5, dt)
    m.rotation.y = damp(m.rotation.y, pointer.x * 0.22, 1.5, dt)
    m.position.y = position[1] + Math.sin(t * 0.42 + phase) * 0.2
  })

  return (
    <mesh ref={mesh} position={position} scale={scale} material={mat}>
      <torusGeometry args={[1, 0.055, 48, 256]} />
    </mesh>
  )
}

/* ================================================================== */
/** The material cube — its face tint is driven by the Materials section. */
export function MaterialCube({ position = [0, 0, 0], scale = 1, colorRef }) {
  const group = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({ ...MarbleMaterial, uniforms: THREE.UniformsUtils.clone(MarbleMaterial.uniforms) }), [])
  const target = useMemo(() => new THREE.Color('#EDEAE4'), [])

  useFrame((_, dt) => {
    const t = performance.now() / 1000
    mat.uniforms.uTime.value = t
    if (colorRef?.current) target.set(colorRef.current)
    mat.uniforms.uBase.value.lerp(target, 1 - Math.exp(-2.2 * dt))

    const g = group.current
    // Driven by scroll within the materials chapter, plus a mouse nudge.
    g.rotation.y = damp(g.rotation.y, scrollStore.local * Math.PI * 2 + pointer.x * 0.28, 2.4, dt)
    g.rotation.x = damp(g.rotation.x, -0.18 + pointer.y * 0.16, 2.0, dt)
    g.position.y = position[1] + Math.sin(t * 0.55) * 0.08
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh material={mat}>
        <boxGeometry args={[1.35, 1.35, 1.35, 4, 4, 4]} />
      </mesh>
      {/* Brass edge outline — a wireframe box very slightly larger. */}
      <lineSegments scale={1.002}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.35, 1.35, 1.35)]} />
        <lineBasicMaterial color="#A98D67" transparent opacity={0.5} />
      </lineSegments>
    </group>
  )
}

/* ================================================================== */
export function GlassPlane({ position = [0, 0, 0], rotation = [0, 0, 0], size = [2, 3], phase = 0 }) {
  const mesh = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({ ...GlassMaterial, uniforms: THREE.UniformsUtils.clone(GlassMaterial.uniforms), side: THREE.DoubleSide, depthWrite: false }), [])

  useFrame((_, dt) => {
    const t = performance.now() / 1000
    mat.uniforms.uTime.value = t
    mat.uniforms.uDark.value = damp(mat.uniforms.uDark.value, scrollStore.darkness, 2.5, dt)

    const m = mesh.current
    m.rotation.y = damp(m.rotation.y, rotation[1] + pointer.x * 0.2, 1.2, dt)
    m.rotation.x = damp(m.rotation.x, rotation[0] + pointer.y * 0.1, 1.2, dt)
    m.position.y = position[1] + Math.sin(t * 0.33 + phase) * 0.16
  })

  return (
    <mesh ref={mesh} position={position} rotation={rotation} material={mat}>
      <planeGeometry args={size} />
    </mesh>
  )
}

/* ================================================================== */
/** Wireframe villa — a real massing model, not a decorative box. */
export function WireframeVilla({ position = [0, 0, 0], scale = 1, buildRef }) {
  const group = useRef()
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ ...BlueprintMaterial, uniforms: THREE.UniformsUtils.clone(BlueprintMaterial.uniforms), depthWrite: false }),
    []
  )

  // Massing: a long low volume, a taller cross-wing, a colonnade, a flat roof plane.
  const volumes = useMemo(
    () => [
      { p: [0, 0, 0], s: [3.4, 0.95, 1.9] },
      { p: [1.2, 0.55, -0.35], s: [1.3, 2.05, 1.5] },
      { p: [-1.5, -0.12, 0.85], s: [1.1, 0.7, 0.9] },
      { p: [0, 1.02, 0], s: [3.8, 0.06, 2.3] },
    ],
    []
  )

  const columns = useMemo(() => Array.from({ length: 7 }, (_, i) => [-1.55 + i * 0.52, -0.06, 1.02]), [])

  useFrame((_, dt) => {
    const t = performance.now() / 1000
    mat.uniforms.uTime.value = t
    if (buildRef) mat.uniforms.uBuild.value = damp(mat.uniforms.uBuild.value, buildRef.current, 4, dt)

    const g = group.current
    g.rotation.y = damp(g.rotation.y, -0.55 + pointer.x * 0.3 + (buildRef?.current ?? 0) * 0.9, 1.6, dt)
    g.rotation.x = damp(g.rotation.x, 0.16 + pointer.y * 0.1, 1.6, dt)
  })

  return (
    <group ref={group} position={position} scale={scale}>
      {volumes.map((v, i) => (
        <lineSegments key={i} position={v.p} material={mat}>
          <edgesGeometry args={[new THREE.BoxGeometry(...v.s)]} />
        </lineSegments>
      ))}
      {columns.map((p, i) => (
        <lineSegments key={`c${i}`} position={p} material={mat}>
          <edgesGeometry args={[new THREE.CylinderGeometry(0.045, 0.045, 0.92, 8)]} />
        </lineSegments>
      ))}
      {/* Site grid */}
      <gridHelper args={[9, 18, '#3E6B7A', '#22404A']} position={[0, -0.5, 0]} />
    </group>
  )
}

/* ================================================================== */
/** Dust in a sunbeam. One draw call, GPU-animated, never touched by the CPU. */
export function LightParticles({ count = 420 }) {
  const points = useRef()

  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const size = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
      seed[i] = Math.random() * 100
      size[i] = 1 + Math.random() * 2.6
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uDark: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform vec2  uPointer;
        varying float vAlpha;
        void main(){
          vec3 p = position;
          // Slow convection drift — dust never falls straight.
          p.y += sin(uTime*0.16 + aSeed) * 0.55;
          p.x += cos(uTime*0.11 + aSeed*1.7) * 0.45 + uPointer.x * 0.5;
          p.z += sin(uTime*0.09 + aSeed*0.6) * 0.35;
          p.y -= uPointer.y * 0.3;

          vec4 mv = modelViewMatrix * vec4(p,1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * (170.0 / -mv.z);
          vAlpha = 0.30 + 0.35 * sin(uTime*0.7 + aSeed*2.1);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uDark;
        varying float vAlpha;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          vec3 col = mix(vec3(0.66,0.55,0.40), vec3(1.0,0.96,0.88), uDark);
          gl_FragColor = vec4(col, a * mix(0.5, 1.0, uDark));
        }
      `,
    })

    return { geometry: g, material: m }
  }, [count])

  useFrame((_, dt) => {
    material.uniforms.uTime.value = performance.now() / 1000
    material.uniforms.uDark.value = damp(material.uniforms.uDark.value, scrollStore.darkness, 2, dt)
    material.uniforms.uPointer.value.set(pointer.x, pointer.y)
    points.current.rotation.y += dt * 0.008
  })

  return <points ref={points} geometry={geometry} material={material} />
}
