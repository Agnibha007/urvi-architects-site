import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '@/hooks/usePointer'
import { scrollStore } from '@/hooks/useScrollStore'
import { MarbleMaterial, BrassMaterial } from './shaders'

const damp = (cur, target, lambda, dt) => THREE.MathUtils.damp(cur, target, lambda, dt)

/**
 * ChairExplosion — a procedural Italian lounge chair that rotates,
 * explodes outward, then reassembles, driven entirely by scroll.
 *
 * The chair is built from primitive geometries (boxes, cylinders) so
 * every piece can move independently. Each part has a "rest" position
 * (assembled) and an "exploded" position (scattered).
 *
 * Timeline (0 → 1 scroll progress):
 *   0.00 – 0.35  Rotation (chair enters, slight tilt)
 *   0.35 – 0.65  Explosion (parts fly outward)
 *   0.65 – 1.00  Reassembly (parts return)
 */

// Chair part definitions: rest position, exploded position, geometry args, rotation, material type
const PARTS = [
  // Seat
  {
    name: 'seat',
    rest: [0, 0, 0],
    exploded: [0, 1.8, 0.3],
    geom: 'box',
    args: [1.6, 0.12, 1.4],
    rot: [0, 0, 0],
    material: 'marble',
  },
  // Backrest
  {
    name: 'backrest',
    rest: [0, 0.65, -0.55],
    exploded: [0, 2.4, -1.2],
    geom: 'box',
    args: [1.4, 0.9, 0.1],
    rot: [-0.25, 0, 0],
    material: 'marble',
  },
  // Front-left leg
  {
    name: 'leg-fl',
    rest: [-0.65, -0.45, 0.55],
    exploded: [-1.8, -1.6, 1.4],
    geom: 'cylinder',
    args: [0.04, 0.035, 0.85, 12],
    rot: [0, 0, 0],
    material: 'brass',
  },
  // Front-right leg
  {
    name: 'leg-fr',
    rest: [0.65, -0.45, 0.55],
    exploded: [1.8, -1.6, 1.4],
    geom: 'cylinder',
    args: [0.04, 0.035, 0.85, 12],
    rot: [0, 0, 0],
    material: 'brass',
  },
  // Back-left leg
  {
    name: 'leg-bl',
    rest: [-0.65, -0.45, -0.55],
    exploded: [-1.8, -1.6, -1.4],
    geom: 'cylinder',
    args: [0.04, 0.035, 0.85, 12],
    rot: [0, 0, 0],
    material: 'brass',
  },
  // Back-right leg
  {
    name: 'leg-br',
    rest: [0.65, -0.45, -0.55],
    exploded: [1.8, -1.6, -1.4],
    geom: 'cylinder',
    args: [0.04, 0.035, 0.85, 12],
    rot: [0, 0, 0],
    material: 'brass',
  },
  // Left armrest
  {
    name: 'arm-l',
    rest: [-0.82, 0.28, -0.1],
    exploded: [-2.2, 0.8, -0.6],
    geom: 'box',
    args: [0.08, 0.08, 1.1],
    rot: [0, 0, 0.06],
    material: 'brass',
  },
  // Right armrest
  {
    name: 'arm-r',
    rest: [0.82, 0.28, -0.1],
    exploded: [2.2, 0.8, -0.6],
    geom: 'box',
    args: [0.08, 0.08, 1.1],
    rot: [0, 0, -0.06],
    material: 'brass',
  },
  // Seat cushion
  {
    name: 'cushion',
    rest: [0, 0.1, 0.02],
    exploded: [0, 2.8, 0.8],
    geom: 'box',
    args: [1.3, 0.14, 1.1],
    rot: [0, 0, 0],
    material: 'marble',
  },
  // Back cushion
  {
    name: 'back-cushion',
    rest: [0, 0.65, -0.42],
    exploded: [0, 3.2, -1.8],
    geom: 'box',
    args: [1.1, 0.65, 0.12],
    rot: [-0.25, 0, 0],
    material: 'marble',
  },
]

function ChairPart({ def, phase }) {
  const mesh = useRef()
  const progressRef = useRef(0)

  const marbleMat = useMemo(
    () => new THREE.ShaderMaterial({ ...MarbleMaterial, uniforms: THREE.UniformsUtils.clone(MarbleMaterial.uniforms) }),
    []
  )
  const brassMat = useMemo(
    () => new THREE.ShaderMaterial({ ...BrassMaterial, uniforms: THREE.UniformsUtils.clone(BrassMaterial.uniforms) }),
    []
  )

  const mat = def.material === 'brass' ? brassMat : marbleMat

  useFrame((_, dt) => {
    if (!mesh.current) return
    const t = performance.now() / 1000

    // Read progress directly from scrollStore (mutated every frame, never triggers React)
    const progress = scrollStore.section === 'hero' ? scrollStore.local : 0
    progressRef.current = progress

    // Update shader uniforms
    if (mat.uniforms.uTime) mat.uniforms.uTime.value = t
    if (mat.uniforms.uDark) {
      mat.uniforms.uDark.value = damp(mat.uniforms.uDark.value, scrollStore.darkness, 2.5, dt)
    }

    // Explode curve: bell shape peaking at ~0.5 scroll
    const rawT = (progress - 0.35) / 0.6
    const explodeT = progress < 0.35 || progress > 0.95 ? 0 : Math.sin(rawT * Math.PI)

    // Interpolate position
    const tx = def.rest[0] + (def.exploded[0] - def.rest[0]) * explodeT
    const ty = def.rest[1] + (def.exploded[1] - def.rest[1]) * explodeT
    const tz = def.rest[2] + (def.exploded[2] - def.rest[2]) * explodeT

    // Subtle floating animation during explosion
    const floatY = Math.sin(t * 0.6 + phase) * 0.04 * explodeT

    mesh.current.position.x = damp(mesh.current.position.x, tx, 3.5, dt)
    mesh.current.position.y = damp(mesh.current.position.y, ty + floatY, 3.5, dt)
    mesh.current.position.z = damp(mesh.current.position.z, tz, 3.5, dt)

    // Slight rotation during explosion
    mesh.current.rotation.x = damp(mesh.current.rotation.x, def.rot[0] + explodeT * 0.15 * Math.sin(phase), 2.8, dt)
    mesh.current.rotation.z = damp(mesh.current.rotation.z, def.rot[2] + explodeT * 0.1 * Math.cos(phase), 2.8, dt)
  })

  return (
    <mesh ref={mesh} material={mat}>
      {def.geom === 'box' ? (
        <boxGeometry args={def.args} />
      ) : (
        <cylinderGeometry args={def.args} />
      )}
    </mesh>
  )
}

export default function ChairExplosion() {
  const group = useRef()

  useFrame((_, dt) => {
    if (!group.current) return

    const progress = scrollStore.section === 'hero' ? scrollStore.local : 0

    // Whole-chair rotation during first phase
    if (progress < 0.35) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, progress * 8, 2.0, dt)
    }

    // Gentle pointer-driven tilt
    group.current.rotation.x = damp(group.current.rotation.x, pointer.y * 0.08, 1.8, dt)
    group.current.rotation.z = damp(group.current.rotation.z, pointer.x * 0.04, 1.8, dt)
  })

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      {PARTS.map((def, i) => (
        <ChairPart
          key={def.name}
          def={def}
          phase={i * 0.7}
        />
      ))}
    </group>
  )
}
