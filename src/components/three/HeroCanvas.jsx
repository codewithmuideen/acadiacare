import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { fullscreenVertex, heroFragment } from './shaders'

const DURATION = 1.7 // seconds per transition
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function useTextures(slides, width) {
  const [textures, setTextures] = useState([])
  useEffect(() => {
    let alive = true
    const loader = new THREE.TextureLoader()
    const list = []
    slides.forEach((s, i) => {
      loader.load(`/assets/images/${s.name}-${width}.webp`, (tex) => {
        tex.colorSpace = THREE.NoColorSpace // pass sRGB values straight through
        tex.minFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        list[i] = tex
        if (alive) setTextures([...list])
      })
    })
    return () => {
      alive = false
      list.forEach((t) => t?.dispose())
    }
  }, [slides, width])
  return textures
}

function TransitionPlane({ slides, index, textures, pointer, origin, onReady }) {
  const { size } = useThree()
  const state = useRef({ from: index, to: index, t: 1 })
  const hover = useRef(0)
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))

  const uniforms = useMemo(
    () => ({
      uTex1: { value: null },
      uTex2: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg1: { value: new THREE.Vector2(1, 1) },
      uImg2: { value: new THREE.Vector2(1, 1) },
      uPos1: { value: new THREE.Vector2(0.5, 0.5) },
      uPos2: { value: new THREE.Vector2(0.5, 0.5) },
      uProgress: { value: 1 },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      uTint: { value: new THREE.Color('#F59AD6') },
    }),
    [],
  )

  // Create the material once and mutate its own uniforms every frame.
  // (Passing `uniforms` as a JSX prop lets R3F copy them, so updates would be lost.)
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: fullscreenVertex, fragmentShader: heroFragment, uniforms, depthWrite: false, depthTest: false }),
    [uniforms],
  )
  useEffect(() => () => material.dispose(), [material])

  // Start a transition whenever the active index changes
  useEffect(() => {
    const s = state.current
    if (index === s.to) return
    s.from = s.to // interrupting mid-transition continues from the latest image
    s.to = index
    s.t = 0
    uniforms.uOrigin.value.set(origin.current.x, origin.current.y)
  }, [index, origin, uniforms])

  const readySent = useRef(false)
  useFrame((_, delta) => {
    const s = state.current
    const a = textures[s.from]
    const b = textures[s.to]
    if (!a || !b) return
    if (!readySent.current) {
      readySent.current = true
      onReady?.()
    }
    s.t = Math.min(1, s.t + delta / DURATION)
    const p = easeInOut(s.t)
    uniforms.uTex1.value = a
    uniforms.uTex2.value = b
    uniforms.uImg1.value.set(a.image.width, a.image.height)
    uniforms.uImg2.value.set(b.image.width, b.image.height)
    const pa = slides[s.from].focus ?? [0.5, 0.5]
    const pb = slides[s.to].focus ?? [0.5, 0.5]
    uniforms.uPos1.value.set(pa[0], 1 - pa[1])
    uniforms.uPos2.value.set(pb[0], 1 - pb[1])
    uniforms.uProgress.value = p
    if (s.t >= 1) s.from = s.to
    uniforms.uTime.value += delta
    uniforms.uRes.value.set(size.width, size.height)

    // Smooth pointer + hover
    const target = pointer.current
    hover.current += ((target.inside ? 1 : 0) - hover.current) * Math.min(1, delta * 4)
    const k = Math.min(1, delta * 6)
    mouse.current.x += (target.x - mouse.current.x) * k
    mouse.current.y += (target.y - mouse.current.y) * k
    uniforms.uHover.value = hover.current
    uniforms.uMouse.value.copy(mouse.current)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/**
 * WebGL image stage for the hero. `pointer` and `origin` are refs owned by
 * the parent (normalised 0..1, y up) so pointer movement never re-renders React.
 */
export default function HeroCanvas({ slides, index, pointer, origin, active = true, onReady }) {
  const width = typeof window !== 'undefined' && window.innerWidth * Math.min(window.devicePixelRatio, 2) > 1400 ? 1800 : 1200
  const textures = useTextures(slides, width)
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false }}
      orthographic
      camera={{ position: [0, 0, 1] }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <TransitionPlane slides={slides} index={index} textures={textures} pointer={pointer} origin={origin} onReady={onReady} />
    </Canvas>
  )
}
