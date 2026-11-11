import { motion, useReducedMotion } from 'motion/react'
import { ease, viewport } from '../../lib/motion'

/** Fade/slide content into view once. */
export default function Reveal({ as = 'div', children, delay = 0, y = 28, x = 0, className, ...rest }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div
  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={viewport}
      transition={{ duration: reduce ? 0.3 : 0.95, ease, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Clip-path image reveal (a curtain lifting) with a gentle settle-in scale. */
export function ImageReveal({ children, className, delay = 0, direction = 'up', immediate = false }) {
  const reduce = useReducedMotion()
  const from = {
    up: 'inset(100% 0% 0% 0%)',
    down: 'inset(0% 0% 100% 0%)',
    left: 'inset(0% 0% 0% 100%)',
    right: 'inset(0% 100% 0% 0%)',
  }[direction]
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport }
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: reduce ? { opacity: 0 } : { clipPath: from },
        show: reduce
          ? { opacity: 1, transition: { duration: 0.3 } }
          : { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.25, ease, delay } },
      }}
    >
      <motion.div
        className="h-full w-full"
        variants={{
          hidden: reduce ? {} : { scale: 1.16 },
          show: reduce ? {} : { scale: 1, transition: { duration: 1.7, ease, delay } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
