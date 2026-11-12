import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { company, intro, legalNav, nav, offices, services } from '../../data/site'
import Container from '../common/Container'
import { Logo } from './Navbar'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="grain relative overflow-hidden bg-ink pb-28 pt-20 text-cream/75 md:pb-10 md:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/15 blur-[120px]" />
      <Container className="relative">
        {/* Signature line */}
        <div className="grid gap-10 border-b border-cream/10 pb-16 lg:grid-cols-12 lg:items-end">
          <p className="font-display text-display-md text-cream lg:col-span-8">
            Compassionate, professional care,
            <span className="italic text-brand-soft"> with dignity at its heart.</span>
          </p>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Link
              to="/contact-acadia-care"
              className="group inline-flex items-center gap-3 rounded-full bg-cream px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-brand-soft"
            >
              Talk to our team
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" aria-hidden="true" />
            </Link>
            <Link
              to="/application"
              className="inline-flex items-center gap-3 rounded-full border border-cream/25 px-6 py-3.5 font-semibold text-cream transition-colors hover:border-cream"
            >
              Careers
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo light className="h-11" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed">{intro.lead}</p>
            <p className="mt-4 text-sm text-cream/55">Established {company.established} · Registered with the CQC</p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">Explore</h2>
            <ul className="space-y-3 text-sm">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="link-underline transition-colors hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">Services</h2>
            <ul className="space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.id}>
                  <Link to={`/services#${s.id}`} className="link-underline transition-colors hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {offices.map((o) => (
            <address key={o.id} className="not-italic lg:col-span-2">
              <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">{o.short}</h2>
              <p className="mb-3 text-sm font-semibold text-cream">{o.name}</p>
              <ul className="space-y-2.5 text-sm">
                {o.address && (
                  <li className="flex gap-2.5">
                    <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-soft" aria-hidden="true" />
                    <span>{o.address.join(', ')}</span>
                  </li>
                )}
                {o.phones.map((p) => (
                  <li key={p.href} className="flex gap-2.5">
                    <Phone className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-soft" aria-hidden="true" />
                    <a href={p.href} className="link-underline hover:text-white">
                      {p.label}
                    </a>
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <Mail className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-soft" aria-hidden="true" />
                  <a href={`mailto:${o.email}`} className="link-underline break-all hover:text-white">
                    {o.email}
                  </a>
                </li>
              </ul>
            </address>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {company.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6">
            {legalNav.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-underline hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
