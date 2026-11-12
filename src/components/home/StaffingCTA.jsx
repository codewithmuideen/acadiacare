import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import Container from '../common/Container'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import SplitText from '../common/SplitText'
import Img from '../common/Img'
import { services } from '../../data/site'

const staffing = services.find((s) => s.id === 'staffing-queries')

const facts = [
  { label: 'Bank', text: 'Support Workers & Care Assistants on call' },
  { label: 'Temporary', text: 'Within a few hours if necessary' },
  { label: 'Contract', text: 'For any length of time' },
]

export default function StaffingCTA() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-10%', '10%'])

  return (
    <section ref={ref} aria-labelledby="staffing-title" className="relative isolate overflow-hidden bg-ink py-28 text-cream md:py-40">
      <motion.div style={{ y }} className="absolute inset-[-12%_0] -z-10">
        <Img name="carer-embrace-mono" sizes="100vw" alt="" position="60% 40%" />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />

      <Container>
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow eyebrow-light mb-6">For care providers &amp; healthcare organisations</p>
          </Reveal>
          <SplitText
            id="staffing-title"
            className="text-display-lg text-cream"
            parts={['The right staff,', { text: 'when you need them.', className: 'italic text-brand-soft' }]}
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/75">{staffing.paragraphs[1]} {staffing.paragraphs[2].split('. ')[0]}.</p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <dl className="mt-14 grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-cream/15 bg-cream/15 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="bg-ink/70 p-6 backdrop-blur-sm">
                <dt className="font-display text-3xl text-cream">{f.label}</dt>
                <dd className="mt-2 text-sm text-cream/65">{f.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.25} className="mt-12 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
          <Button to="/contact-acadia-care?subject=staffing" size="lg">
            Discuss your staffing requirements
          </Button>
          <Button to="/services#staffing-queries" variant="outline-light" size="lg">
            How staffing works
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
