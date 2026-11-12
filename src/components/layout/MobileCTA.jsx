import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { MessageSquareText, Phone } from 'lucide-react'
import { primaryPhone } from '../../data/site'
import { useScrolled } from '../../hooks/useScrolled'

/** Sticky contact bar on small screens, shown after the visitor scrolls. */
export default function MobileCTA() {
  const scrolled = useScrolled(500)
  const { pathname } = useLocation()
  // Hide on pages where it would compete with a form's own actions
  const hidden = pathname.startsWith('/application') || pathname.startsWith('/contact')
  return (
    <AnimatePresence>
      {scrolled && !hidden && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/95 backdrop-blur-lg md:hidden"
        >
          <div className="grid grid-cols-2 gap-2 px-4 py-3">
            <a
              href={primaryPhone.href}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-ink/15 text-sm font-semibold text-ink"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call us
            </a>
            <Link
              to="/contact-acadia-care"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-strong text-sm font-semibold text-white"
            >
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              Enquire
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
