'use client'

/**
 * The hero sculpture: a flat-shaded core (the contract) inside a set of
 * tilted point rings (ledgers closing), each carrying one lit satellite.
 * Rendered with three.js through react-three-fiber. Loaded lazily by
 * `HeroSculpture`, never on the server.
 *
 * Inputs are refs so scroll and pointer never re-render React:
 *  - progress: 0 at the top of the page → 1 when the hero has scrolled away
 *  - pointer:  normalised cursor position, -1..1 on both axes
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export type SculptureRefs = {
  progress: React.MutableRefObject<number>
  pointer: React.MutableRefObject<{ x: number; y: number }>
  /** Called once the first frame has been drawn, so the still can hand over without a blank. */
  onFirstFrame?: () => void
}

type Quality = 'low' | 'high'
/** Where the armature sits in the hero: beside the copy, or above it on narrow screens. */
export type SculptureLayout = 'wide' | 'narrow'

// Colours live here, not in CSS: the scene is drawn on a transparent canvas
// over the page canvas, so they are tuned to the dark theme tokens.
const INK = new THREE.Color('#efebe4')
const IRIS = new THREE.Color('#9d8cff')
const WARM = new THREE.Color('#fff1dc')
const FACET = new THREE.Color('#1d1a16')

const RINGS = [
  { radius: 1.45, tilt: [0.95, 0.35], speed: 0.21, phase: 0.2 },
  { radius: 1.85, tilt: [1.25, -0.6], speed: -0.15, phase: 2.1 },
  { radius: 2.25, tilt: [0.55, 1.15], speed: 0.11, phase: 4.0 },
  { radius: 2.65, tilt: [1.45, 0.2], speed: -0.085, phase: 1.1 },
  { radius: 3.05, tilt: [0.75, -1.3], speed: 0.065, phase: 3.3 },
] as const

const CORE_RADIUS = 0.72
const LAYOUT_OFFSET: Record<SculptureLayout, [number, number]> = { wide: [2.7, 0.1], narrow: [0, 2.1] }

function ringGeometry(radius: number, count: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = Math.sin(angle) * radius
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

function dustGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    // A shell around the rings, denser towards the equator.
    const r = 5.2 + Math.random() * 4.5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.7
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

function Ring({ radius, tilt, speed, phase, quality, time }: (typeof RINGS)[number] & { quality: Quality; time: React.MutableRefObject<number> }) {
  const satellite = useRef<THREE.Mesh>(null)
  const count = quality === 'high' ? 520 : 260
  const points = useMemo(() => ringGeometry(radius, count), [radius, count])
  const line = useMemo(() => ringGeometry(radius, 180), [radius])

  useFrame(() => {
    if (!satellite.current) return
    const angle = phase + time.current * speed
    satellite.current.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
  })

  return (
    <group rotation={[tilt[0], tilt[1], 0]}>
      <points geometry={points}>
        <pointsMaterial color={INK} size={0.015} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
      </points>
      <lineLoop geometry={line}>
        <lineBasicMaterial color={INK} transparent opacity={0.12} depthWrite={false} />
      </lineLoop>
      <mesh ref={satellite}>
        <sphereGeometry args={[0.042, 12, 12]} />
        <meshBasicMaterial color={IRIS} />
      </mesh>
    </group>
  )
}

function Core({ time }: { time: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!group.current) return
    group.current.rotation.x = time.current * 0.08
    group.current.rotation.y = time.current * 0.12
  })
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[CORE_RADIUS, 1]} />
        <meshStandardMaterial color={FACET} roughness={0.7} metalness={0.2} flatShading />
      </mesh>
      <mesh scale={1.004}>
        <icosahedronGeometry args={[CORE_RADIUS, 1]} />
        <meshBasicMaterial color={INK} wireframe transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Scene({ progress, pointer, quality, reduced, layout, onFirstFrame }: SculptureRefs & { quality: Quality; reduced: boolean; layout: SculptureLayout }) {
  const rig = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const time = useRef(0)
  const drawn = useRef(false)
  const { camera } = useThree()
  const dust = useMemo(() => dustGeometry(quality === 'high' ? 1400 : 600), [quality])
  const [offsetX, offsetY] = LAYOUT_OFFSET[layout]

  useFrame((_, delta) => {
    if (!drawn.current) {
      drawn.current = true
      onFirstFrame?.()
    }
    if (!reduced) time.current += Math.min(delta, 0.05)
    const p = progress.current
    // Dolly in and drift up as the hero scrolls away.
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 9.2 - p * 2.2, 0.08)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, p * 1.6, 0.08)
    camera.lookAt(0, 0, 0)
    if (rig.current) {
      // Pointer parallax on the whole armature, eased.
      rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, 0.18 + pointer.current.y * 0.12, 0.05)
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, -0.35 + pointer.current.x * 0.16, 0.05)
    }
    if (spin.current) spin.current.rotation.y = time.current * 0.05
  })

  return (
    <>
      <ambientLight intensity={0.55} color={INK} />
      {/* Warm key from the upper left, iris rim from the right: the facets read as carved stone. */}
      <pointLight position={[offsetX - 3.2, offsetY + 3, 4]} intensity={34} color={WARM} distance={14} decay={2} />
      <pointLight position={[offsetX + 3.4, offsetY + 1.2, 2.4]} intensity={44} color={IRIS} distance={14} decay={2} />
      <group ref={rig} position={[offsetX, offsetY, 0]}>
        <group ref={spin}>
          <Core time={time} />
          {RINGS.map((ring) => (
            <Ring key={ring.radius} {...ring} quality={quality} time={time} />
          ))}
        </group>
        <points geometry={dust}>
          <pointsMaterial color={INK} size={0.016} sizeAttenuation transparent opacity={0.32} depthWrite={false} />
        </points>
      </group>
    </>
  )
}

export default function OrbitSculpture({ progress, pointer, quality, reduced, layout, onFirstFrame }: SculptureRefs & { quality: Quality; reduced: boolean; layout: SculptureLayout }) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.75] : 1}
      camera={{ position: [0, 0, 9.2], fov: 36, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      <Scene progress={progress} pointer={pointer} quality={quality} reduced={reduced} layout={layout} onFirstFrame={onFirstFrame} />
    </Canvas>
  )
}
