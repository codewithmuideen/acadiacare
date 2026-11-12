import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Clock, Mail, Phone } from 'lucide-react'
import { nav, primaryPhone, primaryEmail, company } from '../../data/site'
import { useScrolled } from '../../hooks/useScrolled'
import { cn } from '../../lib/cn'
import Button from '../common/Button'
import MobileMenu from './MobileMenu'

export function Logo({ className, light = false }) {
  return (
    <Link to="/" className={cn('relative block shrink-0', className)} aria-label="Acadia Care home">
      <img
        src={light ? '/assets/brand/acadia-logo-white.png' : '/assets/brand/acadia-logo.png'}
        alt="Acadia Support, a trusted care service"
        width="640"
        height="186"
        className="h-full w-auto"
      />
    </Link>
  )
}

export default function Navbar() {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-soft',
          scrolled && 'lg:-translate-y-9',
        )}
      >
        {/* Contact strip */}
        <div className="hidden h-9 bg-ink text-[0.8rem] text-cream/80 lg:block">
          <div className="container-site flex h-full items-center justify-between">
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-brand-soft" aria-hidden="true" />
              Office hours: {company.officeHours}
            </p>
            <div className="flex items-center gap-6">
              <a href={primaryPhone.href} className="flex items-center gap-2 transition-colors hover:text-white">
                <Phone className="h-3.5 w-3.5 text-brand-soft" aria-hidden="true" />
                {primaryPhone.label}
              </a>
              <a href={`mailto:${primaryEmail}`} className="flex items-center gap-2 transition-colors hover:text-white">
                <Mail className="h-3.5 w-3.5 text-brand-soft" aria-hidden="true" />
                {primaryEmail}
              </a>
              <Link to="/application" className="font-semibold text-brand-soft transition-colors hover:text-white">
                We’re recruiting. Apply now
              </Link>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={cn(
            'transition-all duration-500 ease-soft',
            scrolled || open
              ? 'border-b border-ink/5 bg-cream/85 shadow-[0_10px_40px_-24px_rgb(31_26_23/0.35)] backdrop-blur-xl'
              : 'border-b border-transparent bg-transparent',
          )}
        >
          <nav aria-label="Main" className="container-site flex h-[76px] items-center justify-between gap-6">
            <Logo className="h-9 sm:h-10 lg:h-11" />

            <ul className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'relative block rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors',
                        isActive ? 'text-ink' : 'text-ink-soft hover:text-brand-strong',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-brand"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-3 lg:flex">
              <Button to="/contact-acadia-care" size="md">
                Make an enquiry
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <a
                href={primaryPhone.href}
                className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 text-ink"
                aria-label={`Call us on ${primaryPhone.label}`}
              >
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-cream"
              >
                <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
                <span aria-hidden="true" className="relative block h-3 w-5">
                  <span
                    className={cn(
                      'absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-500 ease-soft',
                      open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0',
                    )}
                  />
                  <span
                    className={cn(
                      'absolute left-0 h-[1.5px] bg-current transition-all duration-500 ease-soft',
                      open ? 'top-1/2 w-5 -translate-y-1/2 -rotate-45' : 'bottom-0 w-3',
                    )}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
