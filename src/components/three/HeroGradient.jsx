import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

/**
 * Animated mesh-gradient backdrop (ShaderGradient) in Acadia's palette:
 * blush magenta, warm cream and a whisper of the monogram's steel blue.
 * lightType "3d" uses scene lights only, so no external HDR files are fetched.
 */
export default function HeroGradient({ animate = true }) {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1}
      fov={45}
      pointerEvents="none"
      lazyLoad
    >
      <ShaderGradient
        control="props"
        animate={animate ? 'on' : 'off'}
        type="waterPlane"
        shader="defaults"
        uTime={0}
        uSpeed={0.12}
        uStrength={1.6}
        uDensity={1.1}
        uFrequency={5.5}
        uAmplitude={0}
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        color1="#F7D3EA"
        color2="#F8F5F0"
        color3="#E3B3D6"
        reflection={0.1}
        cAzimuthAngle={180}
        cPolarAngle={80}
        cDistance={2.8}
        cameraZoom={9.1}
        lightType="3d"
        brightness={1.15}
        envPreset="city"
        grain="on"
        toggleAxis={false}
        zoomOut={false}
        hoverState=""
        enableTransition={false}
      />
    </ShaderGradientCanvas>
  )
}
