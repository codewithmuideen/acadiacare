import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Briefcase, Building, Clock, Mail, MapPin, Phone } from 'lucide-react'
import Seo from '../components/common/Seo'
import Container from '../components/common/Container'
import Breadcrumbs from '../components/common/Breadcrumbs'
import SplitText from '../components/common/SplitText'
import Reveal from '../components/common/Reveal'
import Button from '../components/common/Button'
import ContactForm, { resolveSubject } from '../components/forms/ContactForm'
import { company, offices } from '../data/site'

/**
 * Click-to-load map: no third-party Google request (or cookies) until the
 * visitor chooses to load it.
 */
function MapEmbed({ query, title }) {
  const [loaded, setLoaded] = useState(false)
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-sand sm:aspect-[16/10]">
      {loaded ? (
        <iframe title={title} src={src} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-stone/50" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
            <path d="M-10 180 C 80 140, 120 200, 210 150 S 330 90, 420 120" fill="none" stroke="currentColor" strokeWidth="14" />
            <path d="M120 -10 C 140 60, 100 140, 160 260" fill="none" stroke="currentColor" strokeWidth="8" />
            <path d="M300 -10 L 260 260" fill="none" stroke="currentColor" strokeWidth="6" />
            <path d="M-10 60 L 420 90" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-brand-strong text-white shadow-lg">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="relative font-semibold text-ink">{query}</p>
          <div className="relative flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-soft"
            >
              Load map
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-cream px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Open in Google Maps <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <p className="relative max-w-xs text-xs text-muted">Loading the map connects to Google, which may set cookies.</p>
        </div>
      )}
    </div>
  )
}

export default function Contact() {
  const [params] = useSearchParams()
  const defaultSubject = resolveSubject(params.get('subject') || '')
  const breadcrumbs = [{ name: 'Contact Acadia Care', path: '/contact-acadia-care' }]

  return (
    <>
      <Seo
        title="Contact Acadia Care | Stafford & Kent Offices"
        description="Contact Acadia Care in Stafford (01785 747 225) or Kent (01634 610396) about care services, domiciliary care, staffing requirements or working with us."
        path="/contact-acadia-care"
        breadcrumbs={breadcrumbs}
        schema={{
          '@type': 'ContactPage',
          name: 'Contact Acadia Care',
          url: 'https://acadiacare.co.uk/contact-acadia-care',
          about: { '@id': 'https://acadiacare.co.uk/#organization' },
        }}
      />

      <section className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-tint blur-3xl" />
        <Container className="relative">
          <Breadcrumbs items={breadcrumbs} className="mb-10" />
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-6">Contact us</p>
              <SplitText as="h1" inView={false} delay={0.1} className="text-display-lg" parts={['We’re here', { text: 'to help.', className: 'italic text-brand-strong' }]} />
              <Reveal delay={0.3}>
                <p className="lede mt-8 max-w-md">Please use the form or details below to get in touch. Our friendly team respond to all messages during office hours.</p>
                <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                  <Clock className="h-4 w-4" aria-hidden="true" /> {company.officeHours}
                </p>
              </Reveal>

              <Reveal delay={0.4} className="mt-12 grid gap-4">
                <Link
                  to={{ search: '?subject=staffing', hash: '#enquiry' }}
                  className="group flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-strong"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-strong">
                    <Building className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">Business &amp; staffing enquiries</span>
                    <span className="text-sm text-muted">Bank, temporary or contract staff for your organisation</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:rotate-45 group-hover:text-brand-strong" aria-hidden="true" />
                </Link>
                <Link
                  to={{ search: '?subject=recruitment', hash: '#enquiry' }}
                  className="group flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-strong"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-steel-soft text-steel-deep">
                    <Briefcase className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">Recruitment enquiries</span>
                    <span className="text-sm text-muted">Questions about working with Acadia Care</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:rotate-45 group-hover:text-brand-strong" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.2} className="lg:col-span-7" id="enquiry">
              <div className="scroll-mt-28 rounded-[2rem] bg-surface p-6 shadow-[0_40px_80px_-50px_rgb(31_26_23/0.4)] sm:p-10 lg:p-12">
                <h2 className="mb-8 font-display text-3xl">Send us a message</h2>
                <ContactForm key={defaultSubject} defaultSubject={defaultSubject} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section aria-labelledby="offices-title" className="bg-sand py-24 md:py-32">
        <Container>
          <h2 id="offices-title" className="sr-only">
            Our offices
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {offices.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.1} as="article" className="flex flex-col rounded-[2rem] bg-cream p-6 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong">{o.short} office</p>
                <h3 className="mt-3 text-display-sm">{o.name}</h3>
                <address className="mt-8 grid gap-4 not-italic text-ink-soft sm:grid-cols-2">
                  {o.address && (
                    <p className="flex gap-3">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-strong" aria-hidden="true" />
                      <span>
                        {o.address.map((l) => (
                          <span key={l} className="block">
                            {l}
                          </span>
                        ))}
                      </span>
                    </p>
                  )}
                  <div className="space-y-3">
                    {o.phones.map((p) => (
                      <a key={p.href} href={p.href} className="flex items-center gap-3 font-semibold text-ink hover:text-brand-strong">
                        <Phone className="h-4 w-4 shrink-0 text-brand-strong" aria-hidden="true" /> {p.label}
                      </a>
                    ))}
                    <a href={`mailto:${o.email}`} className="flex items-center gap-3 break-all hover:text-brand-strong">
                      <Mail className="h-4 w-4 shrink-0 text-brand-strong" aria-hidden="true" /> {o.email}
                    </a>
                  </div>
                </address>
                <div className="mt-8 flex-1">
                  {o.mapQuery ? (
                    <MapEmbed query={o.mapQuery} title={`Map showing ${o.name}`} />
                  ) : (
                    <div className="flex h-full min-h-[12rem] flex-col justify-end rounded-[1.5rem] bg-ink p-8 text-cream">
                      <p className="font-display text-2xl">Call or email our Stafford team</p>
                      <p className="mt-2 text-sm text-cream/70">Office hours: {company.officeHours}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button href={o.phones[0].href} variant="light" size="sm" icon={Phone}>
                          Call now
                        </Button>
                        <Button href={`mailto:${o.email}`} variant="outline-light" size="sm" icon={Mail}>
                          Email
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
