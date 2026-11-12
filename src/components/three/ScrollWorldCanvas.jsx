import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { planeFragment, planeVertex } from './shaders'

const GAP = 5 // distance between photos along the corridor

function Photo({ name, aspect, position, rotation, scale, camZ }) {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    let alive = true
    let loaded
    new THREE.TextureLoader().load(`/assets/images/${name}-800.webp`, (t) => {
      t.colorSpace = THREE.NoColorSpace
      t.minFilter = THREE.LinearFilter
      t.generateMipmaps = false
      loaded = t
      if (alive) setTex(t)
    })
    return () => {
      alive = false
      loaded?.dispose()
    }
  }, [name])

  const w = scale * aspect
  const h = scale
  const uniforms = useMemo(
    () => ({
      uMap: { value: null },
      uOpacity: { value: 0 },
      uSat: { value: 0 },
      uSize: { value: new THREE.Vector2(w, h) },
      uRadius: { value: 0.12 },
      uBend: { value: 0 },
    }),
    [w, h],
  )

  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: planeVertex, fragmentShader: planeFragment, uniforms, transparent: true, depthWrite: false }),
    [uniforms],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    uniforms.uMap.value = tex
    const dz = position[2] - camZ.current // negative: in front of the camera
    // Fade in from the distance, fade out as the photo passes the camera
    const far = THREE.MathUtils.smoothstep(dz, -26, -14)
    const near = 1 - THREE.MathUtils.smoothstep(dz, -2.2, -0.4)
    uniforms.uOpacity.value = tex ? far * near : 0
    uniforms.uSat.value = THREE.MathUtils.smoothstep(dz, -14, -5)
    uniforms.uBend.value = THREE.MathUtils.clamp((-dz - 3) * 0.02, 0, 0.18)
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, h, 24, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function World({ photos, progressRef, mobile }) {
  const { camera, pointer } = useThree()
  const camZ = useRef(6)
  const end = -(photos.length - 1) * GAP + 2.5

  const layout = useMemo(
    () =>
      photos.map((p, i) => {
        const side = i % 2 === 0 ? -1 : 1
        const x = side * (mobile ? 0.45 + (i % 3) * 0.1 : 1.55 + (i % 3) * 0.35)
        const y = ((i * 37) % 5 - 2) * (mobile ? 0.28 : 0.32)
        return {
          ...p,
          position: [x, y, -i * GAP],
          rotation: [0, -side * (mobile ? 0.1 : 0.22), 0],
          scale: mobile ? 1.15 : 2.1,
        }
      }),
    [photos, mobile],
  )

  useFrame((_, delta) => {
    const target = THREE.MathUtils.lerp(6, end, progressRef.current)
    // Damped follow: smooth, but always tied to the native scroll position
    camZ.current = THREE.MathUtils.damp(camZ.current, target, 5, delta)
    camera.position.z = camZ.current
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * (mobile ? 0.1 : 0.35), 3, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * (mobile ? 0.08 : 0.22), 3, delta)
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, camZ.current - 10)
  })

  return (
    <>
      {layout.map((p) => (
        <Photo key={p.name} {...p} camZ={camZ} />
      ))}
    </>
  )
}

/** Sticky 3D corridor of photographs driven by page scroll (no scroll hijacking). */
export default function ScrollWorldCanvas({ photos, progressRef, active, mobile }) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6], fov: mobile ? 62 : 48, near: 0.1, far: 60 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <World photos={photos} progressRef={progressRef} mobile={mobile} />
    </Canvas>
  )
}
