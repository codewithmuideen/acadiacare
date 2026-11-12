import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { Languages, Smartphone, ShieldCheck, Utensils, Users, Wallet } from 'lucide-react'
import Seo from '../components/common/Seo'
import PageHero from '../components/common/PageHero'
import Container from '../components/common/Container'
import SectionHeading from '../components/common/SectionHeading'
import Reveal, { ImageReveal } from '../components/common/Reveal'
import SplitText from '../components/common/SplitText'
import Img from '../components/common/Img'
import Button from '../components/common/Button'
import { company, history, promises, whoWeAre } from '../data/site'

function Story() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80])
  return (
    <section ref={ref} aria-labelledby="who-title" className="py-24 md:py-32">
      <Container className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading id="who-title" eyebrow="Who are we?" title={['Recruitment with', { text: 'care at its core.', className: 'italic text-brand-strong' }]} />
          <Reveal delay={0.1} className="relative mt-12 hidden lg:block">
            <div className="aspect-[4/5] overflow-hidden rounded-arch">
              <Img name="walker-support" sizes="36vw" position="35% 50%" />
            </div>
            <motion.div style={{ y }} className="absolute -bottom-12 -right-10 w-48 overflow-hidden rounded-[1.5rem] border-[6px] border-cream">
              <Img name="knitting-group" sizes="200px" className="aspect-square" position="20% 50%" />
            </motion.div>
          </Reveal>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-ink-soft lg:col-span-7 lg:pt-24">
          <Reveal>
            <p className="font-display text-display-sm leading-snug text-ink">{whoWeAre.p1.split('. ')[0]}.</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p>{whoWeAre.p1.split('. ').slice(1).join('. ')}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-4 pt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Our services are extended to individuals with</p>
            <ul className="flex flex-wrap gap-2">
              {whoWeAre.conditions.map((c) => (
                <li key={c} className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-[0.95rem] font-medium text-ink">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="pt-6">{whoWeAre.personCentred}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <blockquote className="my-10 border-l-2 border-brand pl-6 font-display text-2xl italic leading-snug text-ink md:text-3xl">
              {whoWeAre.tailored}
            </blockquote>
          </Reveal>
          <Reveal delay={0.1}>
            <p>{whoWeAre.hours}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

const pillars = [
  { icon: Utensils, title: 'Respect for every background', text: whoWeAre.respect },
  { icon: Languages, title: 'Communication skills training', text: whoWeAre.language },
  { icon: Smartphone, title: 'Mobile applications', text: whoWeAre.apps },
  { icon: ShieldCheck, title: 'Enhanced DBS vetting', text: whoWeAre.vetting },
  { icon: Wallet, title: 'A motivated workforce', text: whoWeAre.retention },
  { icon: Users, title: 'Person-centred by design', text: 'Every placement has the client’s utmost needs at the heart of its approach.' },
]

function Pillars() {
  return (
    <section aria-labelledby="pillars-title" className="grain relative bg-ink py-24 text-cream md:py-32">
      <Container>
        <SectionHeading
          id="pillars-title"
          light
          eyebrow="How we work"
          title={['Professional standards,', { text: 'personal respect.', className: 'italic text-brand-soft' }]}
          className="max-w-3xl"
        />
        <ul className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal as="li" key={p.title} delay={(i % 3) * 0.08} className="border-t border-cream/15 pt-8">
              <p.icon className="h-6 w-6 text-brand-soft" aria-hidden="true" />
              <h3 className="mt-6 font-display text-[1.7rem] leading-tight text-cream">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-cream/70">{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function History() {
  return (
    <section aria-labelledby="history-title" className="py-24 md:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <ImageReveal direction="right" className="aspect-[5/4] overflow-hidden rounded-[2rem]">
            <Img name="garden-independence" sizes="(min-width: 1024px) 45vw, 92vw" />
          </ImageReveal>
          <div className="absolute -bottom-8 left-6 rounded-2xl bg-cream px-7 py-5 shadow-xl sm:left-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Established</p>
            <p className="font-display text-5xl text-brand-strong">{company.established}</p>
          </div>
        </div>
        <div className="lg:col-span-6 lg:pl-6">
          <SectionHeading id="history-title" eyebrow="Our history" title={['Over a decade of', { text: 'focus on quality.', className: 'italic text-brand-strong' }]} />
          <ol className="mt-12 space-y-10 border-l border-line pl-8">
            <Reveal as="li" className="relative">
              <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-brand-strong ring-4 ring-cream" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong">2013 · Buckinghamshire</p>
              <p className="mt-3 leading-relaxed text-ink-soft">{history.p1}</p>
            </Reveal>
            <Reveal as="li" delay={0.1} className="relative">
              <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-steel ring-4 ring-cream" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-deep">Today · Staffordshire</p>
              <p className="mt-3 leading-relaxed text-ink-soft">{history.p2}</p>
            </Reveal>
          </ol>
        </div>
      </Container>
    </section>
  )
}

function Promise() {
  return (
    <section aria-labelledby="promise-title" className="bg-sand py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow mb-6 justify-center">Our promise to you</p>
          </Reveal>
          <SplitText
            id="promise-title"
            className="text-display-md"
            parts={['Three commitments to', { text: 'every client & family.', className: 'italic text-brand-strong' }]}
          />
        </div>
        <ol className="mt-16 grid gap-6 lg:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal as="li" key={i} delay={i * 0.1} className="relative rounded-[2rem] bg-cream p-8 md:p-10">
              <span className="font-display text-7xl leading-none text-brand/30" aria-hidden="true">
                0{i + 1}
              </span>
              <p className="mt-6 text-lg leading-relaxed text-ink">{p}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-16 flex flex-col items-center justify-center gap-3 xs:flex-row">
          <Button to="/contact-acadia-care" size="lg">
            Talk to our team
          </Button>
          <Button to="/services" variant="outline" size="lg">
            Explore our services
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}

export default function About() {
  const breadcrumbs = [{ name: 'About Acadia Care', path: '/about-acadia-care' }]
  return (
    <>
      <Seo
        title="About Acadia Care | Person-Centred Care Support in Staffordshire"
        description="Established in 2013, Acadia Support Services Ltd recruits professionally trained, Enhanced DBS-checked support workers and carers, providing person-centred care across Staffordshire."
        path="/about-acadia-care"
        breadcrumbs={breadcrumbs}
      />
      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow="About Acadia Care"
        title={['Dignity, independence', { text: 'and your choice of care.', className: 'italic text-brand-strong' }]}
        intro="Acadia Support Services Ltd specialises in the recruitment of support workers and carers, providing a solution for staffing needs across the whole social care spectrum."
        image="carer-conversation-living-room"
        imagePosition="62% 50%"
      />
      <Story />
      <Pillars />
      <History />
      <Promise />
    </>
  )
}
