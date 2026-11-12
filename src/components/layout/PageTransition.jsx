import { motion, useReducedMotion } from 'motion/react'
import { ease } from '../../lib/motion'

/** Soft fade/lift between routes, with a brief brand-coloured wipe. */
export default function PageTransition({ children }) {
  const reduce = useReducedMotion()
  if (reduce) return children
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.55, ease }}
      >
        {children}
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] origin-top bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease }}
        style={{ transformOrigin: 'top' }}
      />
    </>
  )
}
