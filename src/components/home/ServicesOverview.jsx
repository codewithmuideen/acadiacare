import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'
import Img from '../common/Img'
import { services } from '../../data/site'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'

/**
 * Editorial index of services. On desktop, hovering/focusing a row swaps the
 * photograph in a sticky frame; on mobile each row carries its own image.
 */
export default function ServicesOverview() {
  const [active, setActive] = useState(0)

  return (
    <section aria-labelledby="services-title" className="relative py-24 md:py-36">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="services-title"
            eyebrow="What we do"
            title={['Support shaped around', { text: 'each individual.', className: 'italic text-brand-strong' }]}
            className="max-w-2xl"
          />
          <Reveal className="max-w-sm">
            <p className="text-muted">
              From residential and home-based support to flexible staffing for care providers. Three services, one
              unchanging focus on quality.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12">
          <ol className="lg:col-span-7">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 0.08} className="border-t border-line last:border-b">
                <Link
                  to={`/services#${s.id}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-4 py-8 md:gap-x-8 md:py-10"
                >
                  <span
                    className={cn(
                      'pt-2 font-sans text-sm font-semibold tabular-nums transition-colors duration-500',
                      active === i ? 'text-brand-strong' : 'text-muted',
                    )}
                  >
                    {s.number}
                  </span>
                  <span>
                    <span
                      className={cn(
                        'block font-display text-[2rem] leading-tight transition-all duration-500 ease-soft md:text-5xl',
                        active === i ? 'text-ink lg:translate-x-2' : 'text-ink/70 group-hover:text-ink',
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="mt-3 block max-w-lg text-[0.97rem] leading-relaxed text-muted">{s.short}</span>
                    <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      {s.highlights.map((h) => (
                        <span key={h} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-brand" aria-hidden="true" />
                          {h}
                        </span>
                      ))}
                    </span>
                    {/* Mobile image */}
                    <span className="mt-6 block overflow-hidden rounded-2xl lg:hidden">
                      <Img name={s.image} sizes="90vw" className="aspect-[16/10]" alt="" />
                    </span>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-strong lg:hidden">
                      Read more <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-2 hidden h-12 w-12 place-items-center rounded-full border transition-all duration-500 ease-soft md:grid',
                      active === i
                        ? 'rotate-45 border-brand-strong bg-brand-strong text-white'
                        : 'border-ink/15 text-ink group-hover:border-ink',
                    )}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                  <span className="sr-only">Read more about {s.title}</span>
                </Link>
              </Reveal>
            ))}
          </ol>

          {/* Desktop sticky image frame */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-32">
              <div className="relative aspect-[4/5] overflow-hidden rounded-arch bg-sand">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={services[active].id}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    exit={{ opacity: 0.6 }}
                    transition={{ duration: 0.9, ease }}
                  >
                    <motion.div
                      className="h-full w-full"
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.4, ease }}
                    >
                      <Img name={services[active].image} sizes="40vw" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-full bg-cream/90 px-5 py-3 text-sm backdrop-blur">
                  <span className="font-semibold text-ink">{services[active].title}</span>
                  <span className="tabular-nums text-muted">
                    {services[active].number} / 0{services.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
