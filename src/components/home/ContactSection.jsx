import { Clock, Mail, Phone } from 'lucide-react'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'
import OfficeCards from '../common/OfficeCards'
import ContactForm from '../forms/ContactForm'
import { company, primaryEmail, primaryPhone } from '../../data/site'

export default function ContactSection({ defaultSubject }) {
  return (
    <section aria-labelledby="contact-title" className="relative bg-sand py-24 md:py-36" id="contact">
      <Container className="grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contact-title"
            eyebrow="Contact us"
            title={['Let’s talk about', { text: 'the care you need.', className: 'italic text-brand-strong' }]}
            intro="Please use the form or details below to get in touch. Our friendly team are happy to help."
          />
          <Reveal delay={0.1} className="mt-10 grid gap-3 sm:grid-cols-2">
            <a
              href={primaryPhone.href}
              className="group flex items-center gap-4 rounded-2xl border border-ink/10 bg-cream p-4 transition-colors hover:border-brand-strong"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-colors group-hover:bg-brand-strong">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs text-muted">Call Stafford</span>
                <span className="font-semibold">{primaryPhone.label}</span>
              </span>
            </a>
            <a
              href={`mailto:${primaryEmail}`}
              className="group flex items-center gap-4 rounded-2xl border border-ink/10 bg-cream p-4 transition-colors hover:border-brand-strong"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-colors group-hover:bg-brand-strong">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted">Email us</span>
                <span className="block truncate font-semibold">{primaryEmail}</span>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4" aria-hidden="true" /> Office hours: {company.officeHours}
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-12">
            <OfficeCards />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="rounded-[2rem] bg-cream p-6 shadow-[0_40px_80px_-50px_rgb(31_26_23/0.4)] sm:p-10 lg:p-12">
            <h3 className="mb-8 font-display text-3xl">Send us a message</h3>
            <ContactForm defaultSubject={defaultSubject} />
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
