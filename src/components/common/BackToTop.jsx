import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { useScrolled } from '../../hooks/useScrolled'
import { getLenis } from '../../hooks/useSmoothScroll'

export default function BackToTop() {
  const visible = useScrolled(900)
  const toTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 right-4 z-40 hidden h-12 w-12 place-items-center rounded-full border border-ink/10 bg-cream/90 text-ink shadow-lg backdrop-blur transition-colors hover:bg-ink hover:text-cream md:bottom-8 md:right-8 md:grid"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
