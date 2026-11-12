import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { Building2, Home, HeartPulse } from 'lucide-react'
import Container from '../common/Container'
import Reveal from '../common/Reveal'
import Marquee from '../common/Marquee'
import { intro, values } from '../../data/site'

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  )
}

/** The company statement, revealed word by word as the reader scrolls. */
function ScrollStatement({ text }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  if (reduce) return <p className="font-display text-display-sm leading-[1.25] text-ink md:text-display-md">{text}</p>
  return (
    <p ref={ref} className="font-display text-display-sm leading-[1.25] text-ink md:text-display-md md:leading-[1.15]">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  )
}

const settingIcons = [Building2, HeartPulse, Home]

export default function Introduction() {
  return (
    <section aria-labelledby="intro-title" className="relative py-24 md:py-36">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Reveal>
              <h2 id="intro-title" className="eyebrow">
                Welcome to Acadia Care
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-9">
            <ScrollStatement text={intro.lead} />

            <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16">
              <Reveal>
                <p className="text-lg leading-relaxed text-ink-soft">{intro.body}</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Where we provide staff</p>
                <ul className="divide-y divide-line border-y border-line">
                  {intro.settings.map((s, i) => {
                    const Icon = settingIcons[i]
                    return (
                      <li key={s} className="group flex items-center gap-4 py-4">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-tint text-brand-strong transition-colors duration-500 group-hover:bg-brand-strong group-hover:text-white">
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        <span className="font-display text-2xl text-ink">{s}</span>
                      </li>
                    )
                  })}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>

      <div className="mt-24 border-y border-line md:mt-32">
        <Marquee items={values} />
      </div>
    </section>
  )
}
