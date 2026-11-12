import { Check } from 'lucide-react'
import Container from '../common/Container'
import Button from '../common/Button'
import Reveal, { ImageReveal } from '../common/Reveal'
import SplitText from '../common/SplitText'
import Img from '../common/Img'

const benefits = ['Competitive rates of pay', 'Work benefits', 'Flexibility around your life', 'Communication skills training']

export default function CareersCTA() {
  return (
    <section aria-labelledby="careers-title" className="relative py-24 md:py-36">
      <Container>
        <div className="relative grid overflow-hidden rounded-[2.5rem] bg-brand-tint lg:grid-cols-2">
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 xl:p-20">
            <Reveal>
              <p className="eyebrow mb-6">Careers at Acadia</p>
            </Reveal>
            <SplitText
              id="careers-title"
              className="text-display-md"
              parts={['Bring your compassion', { text: 'to our team.', className: 'italic text-brand-strong' }]}
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                We’re looking for support workers and carers, qualified or working towards a qualification, who are
                experienced in the field of care and share our commitment to dignity and independence.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[0.95rem] font-medium text-ink">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-strong text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <Button to="/application" size="lg">
                Apply to join our team
              </Button>
            </Reveal>
          </div>
          <ImageReveal direction="left" className="relative min-h-[22rem] lg:min-h-full">
            <Img name="care-professional-home-visit" sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0" position="55% 30%" />
          </ImageReveal>
        </div>
      </Container>
    </section>
  )
}
