import { lazy, Suspense } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'

const LiquidGlass = lazy(() => import('liquid-glass-react'))

/**
 * Liquid glass surface (liquid-glass-react), anchored by its CENTRE point.
 *
 * liquid-glass-react centres itself on its containing block with
 * top/left 50% + translate(-50%,-50%). Wrapping it in a zero-size anchor lets
 * us place the glass anywhere: position the anchor where the glass's centre
 * should be (e.g. `absolute bottom-10 left-1/2`).
 *
 * Reduced-motion users and the loading state get a plain frosted panel.
 */
export default function Glass({ children, anchorClassName, radius = 28, padding = '0px', mouseContainer, onClick, className, strong = false }) {
  const reduce = useReducedMotion()
  const fallback = (
    <div
      className={cn(
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/40 bg-white/25 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-saturate-150',
        className,
      )}
      style={{ borderRadius: radius, padding }}
    >
      {children}
    </div>
  )
  return (
    <div className={cn('absolute h-0 w-0', anchorClassName)}>
      {reduce ? (
        fallback
      ) : (
        <Suspense fallback={fallback}>
          <LiquidGlass
            cornerRadius={radius}
            padding={padding}
            displacementScale={strong ? 70 : 48}
            blurAmount={strong ? 0.12 : 0.06}
            saturation={150}
            aberrationIntensity={1.6}
            elasticity={0.14}
            mouseContainer={mouseContainer}
            onClick={onClick}
            className={className}
            style={{ position: 'absolute', top: '50%', left: '50%' }}
          >
            {children}
          </LiquidGlass>
        </Suspense>
      )}
    </div>
  )
}
