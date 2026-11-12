import { Link } from 'react-router-dom'
import { ArrowDownRight, Phone } from 'lucide-react'
import Seo from '../components/common/Seo'
import PageHero from '../components/common/PageHero'
import Container from '../components/common/Container'
import SectionHeading from '../components/common/SectionHeading'
import Reveal, { ImageReveal } from '../components/common/Reveal'
import SplitText from '../components/common/SplitText'
import Img from '../components/common/Img'
import Button from '../components/common/Button'
import Faq from '../components/common/Faq'
import { faqs, primaryPhone, services } from '../data/site'
import { cn } from '../lib/cn'

const enquiryAlias = {
  'residential-care-support': 'residential',
  'domiciliary-care': 'domiciliary',
  'staffing-queries': 'staffing',
}

const titles = {
  'residential-care-support': ['Residential care', { text: 'support.', className: 'italic text-brand-strong' }],
  'domiciliary-care': ['Domiciliary', { text: 'care.', className: 'italic text-brand-strong' }],
  'staffing-queries': ['Staffing', { text: 'queries.', className: 'italic text-brand-strong' }],
}

function ServiceSection({ service, index }) {
  const flip = index % 2 === 1
  const dark = service.id === 'staffing-queries'
  return (
    <section
      id={service.id}
      aria-labelledby={`${service.id}-title`}
      className={cn('scroll-mt-28 py-24 md:py-32', dark ? 'grain relative bg-ink text-cream' : index % 2 ? 'bg-sand' : '')}
    >
      <Container className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
        <div className={cn('relative lg:col-span-6', flip && 'lg:order-2')}>
          <div className="lg:sticky lg:top-32">
            <ImageReveal direction={flip ? 'left' : 'right'} className="aspect-[4/5] overflow-hidden rounded-arch sm:aspect-[5/4] lg:aspect-[4/5]">
              <Img name={service.image} sizes="(min-width: 1024px) 45vw, 92vw" />
            </ImageReveal>
            <span
              aria-hidden="true"
              className={cn(
                'absolute -top-10 font-display text-[9rem] leading-none md:text-[12rem]',
                flip ? '-right-2' : '-left-2',
                dark ? 'text-cream/10' : 'text-brand/15',
              )}
            >
              {service.number}
            </span>
          </div>
        </div>

        <div className={cn('lg:col-span-6', flip ? 'lg:order-1 lg:pr-4' : 'lg:pl-4')}>
          <Reveal>
            <p className={cn('eyebrow mb-6', dark && 'eyebrow-light')}>Service {service.number}</p>
          </Reveal>
          <SplitText
            as="h2"
            id={`${service.id}-title`}
            className={cn('text-display-lg', dark && 'text-cream')}
            parts={
              dark
                ? ['Staffing', { text: 'queries.', className: 'italic text-brand-soft' }]
                : titles[service.id]
            }
          />
          <div className={cn('mt-10 space-y-5 text-lg leading-relaxed', dark ? 'text-cream/75' : 'text-ink-soft')}>
            {service.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className={i === 0 ? cn('font-display text-2xl leading-snug md:text-[1.75rem]', dark ? 'text-cream' : 'text-ink') : ''}>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <ul className={cn('mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-3', dark ? 'border-cream/15 bg-cream/15' : 'border-line bg-line')}>
              {service.highlights.map((h) => (
                <li key={h} className={cn('p-5 text-sm font-semibold', dark ? 'bg-ink text-cream' : index % 2 ? 'bg-sand text-ink' : 'bg-cream text-ink')}>
                  <span className={cn('mb-3 block h-1.5 w-1.5 rounded-full', dark ? 'bg-brand-soft' : 'bg-brand')} aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <Button to={`/contact-acadia-care?subject=${enquiryAlias[service.id]}`} size="lg">
              {service.id === 'staffing-queries' ? 'Book an appointment' : `Enquire about ${service.title.toLowerCase()}`}
            </Button>
            <Button href={primaryPhone.href} variant={dark ? 'outline-light' : 'outline'} size="lg" icon={Phone}>
              {primaryPhone.label}
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export default function Services() {
  const breadcrumbs = [{ name: 'Services', path: '/services' }]
  const schema = [
    ...services.map((s) => ({
      '@type': 'Service',
      name: s.title,
      description: s.paragraphs[0],
      provider: { '@id': 'https://acadiacare.co.uk/#organization' },
      areaServed: { '@type': 'AdministrativeArea', name: 'Staffordshire' },
      url: `https://acadiacare.co.uk/services#${s.id}`,
    })),
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]
  return (
    <>
      <Seo
        title="Care Services | Residential, Domiciliary Care & Healthcare Staffing"
        description="Residential care support, domiciliary care in Staffordshire and flexible healthcare staffing: bank, temporary or contract support workers and care assistants, within hours if necessary."
        path="/services"
        breadcrumbs={breadcrumbs}
        schema={schema}
      />
      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow="Our services"
        title={['Care and staffing,', { text: 'thoughtfully matched.', className: 'italic text-brand-strong' }]}
        intro="Three services across the social care spectrum, each delivered by professionally trained, Enhanced DBS-checked support workers and carers."
        image="carer-shared-laugh"
        imagePosition="40% 30%"
      >
        <nav aria-label="Services on this page">
          <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {services.map((s) => (
              <li key={s.id}>
                <Link to={`#${s.id}`} className="group inline-flex items-center gap-2 py-1.5 font-semibold text-ink">
                  <ArrowDownRight className="h-4 w-4 text-brand-strong transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                  <span className="link-underline">{s.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {services.map((s, i) => (
        <ServiceSection key={s.id} service={s} index={i} />
      ))}

      <section aria-labelledby="faq-title" className="py-24 md:py-32">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="faq-title" eyebrow="Questions" title={['Frequently', { text: 'asked.', className: 'italic text-brand-strong' }]} />
            <Reveal delay={0.1}>
              <p className="mt-6 text-muted">Can’t find what you’re looking for? Our team are happy to help during office hours.</p>
              <Button to="/contact-acadia-care" variant="outline" className="mt-8">
                Contact us
              </Button>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-8">
            <Faq items={faqs} />
          </Reveal>
        </Container>
      </section>
    </>
  )
}
