import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Mail, Phone } from 'lucide-react'
import { nav, primaryPhone, primaryEmail } from '../../data/site'
import { getLenis } from '../../hooks/useSmoothScroll'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'
import Button from '../common/Button'

/**
 * Drop-down sheet beneath the header (not a full-screen takeover).
 * Escape closes it, focus moves into it and is kept inside while open.
 */
export default function MobileMenu({ open, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const focusables = () => panel?.querySelectorAll('a[href], button:not([disabled])') ?? []
    setTimeout(() => focusables()[0]?.focus(), 50)

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const els = Array.from(focusables())
        if (!els.length) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      lenis?.start()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-x-0 top-[76px] z-40 max-h-[calc(100dvh-76px)] overflow-y-auto rounded-b-[2rem] bg-cream shadow-2xl lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="container-site pb-8 pt-4">
              <ul className="divide-y divide-line">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.12 + i * 0.05 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between py-4 font-display text-[2rem] leading-none transition-colors',
                          isActive ? 'text-brand-strong' : 'text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-center gap-3">
                            {item.label}
                            {isActive && <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />}
                          </span>
                          <ArrowUpRight className="h-5 w-5 opacity-40" aria-hidden="true" />
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.4 }}
                className="mt-6 grid gap-3"
              >
                <Button to="/contact-acadia-care" size="lg" className="w-full" onClick={onClose}>
                  Make an enquiry
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={primaryPhone.href}
                    className="flex items-center justify-center gap-2 rounded-full border border-ink/15 py-3 text-sm font-semibold"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call
                  </a>
                  <a
                    href={`mailto:${primaryEmail}`}
                    className="flex items-center justify-center gap-2 rounded-full border border-ink/15 py-3 text-sm font-semibold"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" /> Email
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
