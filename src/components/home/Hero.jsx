import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BadgeCheck, HeartHandshake, Phone } from 'lucide-react'
import Container from '../common/Container'
import Button from '../common/Button'
import Img from '../common/Img'
import CqcBadge from '../common/CqcBadge'
import { company, primaryPhone } from '../../data/site'
import { ease } from '../../lib/motion'
import { cn } from '../../lib/cn'

// Only sharp, well-lit photos where faces are in focus
const SLIDES = [
  { name: 'carer-embrace-wheelchair', position: '70% 35%' },
  { name: 'carer-shared-laugh', position: '45% 30%' },
  { name: 'carer-leaning-resident', position: '55% 30%' },
]

const SUPPORT = ['Dementia', 'Autism', 'Learning disabilities', 'Mental health', 'Brain trauma', 'Special needs']

const STATS = [
  { value: company.established, label: 'Established' },
  { value: '3', label: 'Care services' },
  { value: '2', label: 'Offices: Stafford & Kent' },
]

const AUTOPLAY_MS = 6000

function SupportList({ tone }) {
  const dark = tone === 'dark'
  return (
    <>
      <p className={cn('mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]', dark ? 'text-white/90' : 'text-brand-strong')}>
        <HeartHandshake className="h-4 w-4" aria-hidden="true" />
        Who we support
      </p>
      <ul className="flex flex-wrap gap-2">
        {SUPPORT.map((s) => (
          <li
            key={s}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium sm:text-[0.8rem]',
              dark ? 'bg-white/90 text-ink shadow-sm backdrop-blur' : 'bg-brand-tint text-ink',
            )}
          >
            {s}
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [reduce])

  const appear = (delay, y = 18) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.3 : 0.9, ease, delay },
  })

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[#FCFAF7] pb-16 pt-[calc(var(--header-h)+2rem)] lg:pb-24 lg:pt-[calc(var(--header-h)+3rem)]"
    >
      {/* Soft colour washes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-brand-tint blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#FDEFF7] blur-3xl" />
        <div className="absolute -right-32 top-10 h-[34rem] w-[34rem] rounded-full bg-[#F6E3EF] blur-3xl" />
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-6">
          <motion.p
            {...appear(0.05)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-strong/15 bg-white/80 px-4 py-2 text-xs font-semibold text-brand-strong shadow-sm backdrop-blur sm:text-[0.8rem]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-strong" />
            </span>
            CQC registered care provider · Staffordshire & Kent
          </motion.p>

          <motion.h1
            id="hero-title"
            {...appear(0.12, 24)}
            className="mt-6 font-sans text-[clamp(2.35rem,4.6vw,4.1rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ink"
          >
            Trusted, compassionate care that puts <span className="text-brand-strong">people first.</span>
          </motion.h1>

          <motion.p {...appear(0.3)} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Since 2013, families and care providers have relied on our qualified, Enhanced DBS-checked carers and support
            workers, delivering residential care support, domiciliary care and staffing with dignity and independence at
            the heart of everything we do.
          </motion.p>

          <motion.div {...appear(0.42)} className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <Button to="/services" size="lg">
              Explore our services
            </Button>
            <Button to="/contact-acadia-care" variant="outline" size="lg" className="bg-white/70 backdrop-blur">
              Talk to our team
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div {...appear(0.55)} className="mt-12 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-ink/5 bg-white/80 px-4 py-4 shadow-[0_12px_30px_-20px_rgb(31_26_23/0.3)] backdrop-blur">
                <p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs leading-snug text-muted sm:text-[0.8rem]">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.a {...appear(0.65)} href={primaryPhone.href} className="group mt-8 inline-flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-cream transition-colors group-hover:bg-brand-strong">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.16em] text-muted">Call our Stafford office</span>
              <span className="font-semibold text-ink">{primaryPhone.label}</span>
            </span>
          </motion.a>
        </div>

        {/* Visual */}
        <motion.div
          className="relative mx-auto w-full max-w-[36rem] px-2 pt-4 sm:px-6 lg:col-span-6 lg:max-w-none lg:pb-10 lg:pl-10 lg:pr-0 lg:pt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0.3 : 1.1, ease, delay: 0.2 }}
        >
          <div className="relative">
            {/* Tilted gradient panel behind the photo */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-1 -bottom-3 top-8 rotate-[-3deg] rounded-[2.5rem] bg-gradient-to-br from-brand via-brand-strong to-brand-deep opacity-90 lg:-left-4 lg:-right-2 lg:top-12"
            />

            {/* Photo: wide on phones so faces stay in frame, tall on desktop */}
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border-[5px] border-white bg-sand shadow-[0_40px_80px_-30px_rgb(31_26_23/0.45)] lg:aspect-auto lg:h-[min(76svh,680px)] lg:rounded-[2.25rem] lg:border-[6px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={SLIDES[index].name}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease }}
                >
                  <Img name={SLIDES[index].name} priority={index === 0} sizes="(min-width: 1024px) 46vw, 92vw" position={SLIDES[index].position} />
                </motion.div>
              </AnimatePresence>

              {/* Who we support (desktop: over the photo) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ink/55 to-transparent lg:block" />
              <div className="absolute inset-x-6 bottom-6 hidden lg:block">
                <SupportList tone="dark" />
              </div>

              {/* Slide dots */}
              <div className="absolute right-4 top-4 flex gap-1.5 rounded-full bg-ink/25 px-2 py-1.5 backdrop-blur-sm" aria-hidden="true">
                {SLIDES.map((s, i) => (
                  <span key={s.name} className={cn('h-1.5 rounded-full bg-white transition-all duration-500', i === index ? 'w-5' : 'w-1.5 opacity-60')} />
                ))}
              </div>
            </div>

            {/* Floating: CQC */}
            <motion.div {...appear(0.9, 12)} className="absolute -top-5 left-3 sm:left-5 lg:-left-6 lg:top-24">
              <CqcBadge variant="compact" />
            </motion.div>

            {/* Floating: DBS */}
            <motion.div
              {...appear(1.05, 12)}
              className="absolute -bottom-6 right-3 flex items-center gap-3 rounded-2xl bg-white/95 py-2.5 pl-2.5 pr-4 shadow-[0_20px_50px_-20px_rgb(31_26_23/0.45)] ring-1 ring-ink/5 backdrop-blur sm:right-5 lg:bottom-auto lg:-right-6 lg:top-[42%]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-ink">Enhanced DBS checked</span>
                <span className="block text-xs text-muted">Every carer vetted</span>
              </span>
            </motion.div>
          </div>

          {/* Who we support (phones/tablets: below the photo, nothing covers faces) */}
          <div className="mt-12 rounded-2xl border border-ink/5 bg-white/85 p-5 shadow-[0_12px_30px_-20px_rgb(31_26_23/0.3)] backdrop-blur lg:hidden">
            <SupportList tone="light" />
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
