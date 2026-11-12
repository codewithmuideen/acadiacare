import { motion } from 'motion/react'
import { BadgeCheck, CalendarClock, Footprints, GraduationCap, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'
import Img from '../common/Img'
import { whyChoose, whoWeAre } from '../../data/site'
import { ease, viewport } from '../../lib/motion'

const icons = { BadgeCheck, CalendarClock, Footprints, GraduationCap, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles }

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-title" className="grain relative overflow-hidden bg-ink py-24 text-cream md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-brand/20 blur-[140px]" />
      <Container className="relative grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              id="why-title"
              light
              eyebrow="Why choose Acadia"
              title={['Professional people.', { text: 'Human care.', className: 'italic text-brand-soft' }]}
              intro={whoWeAre.vetting}
            />
            <Reveal delay={0.2} className="mt-12 hidden lg:block">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
                <Img name="carer-shared-laugh" sizes="36vw" position="50% 35%" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-[2rem] border border-cream/10 bg-cream/10 sm:grid-cols-2 lg:col-span-7">
          {whyChoose.map((item, i) => {
            const Icon = icons[item.icon]
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.8, ease, delay: (i % 2) * 0.08 }}
                className="group relative bg-ink p-8 transition-colors duration-500 hover:bg-[#2a2420] md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-cream/15 text-brand-soft transition-all duration-500 group-hover:border-brand-soft group-hover:bg-brand-soft group-hover:text-ink">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-sans text-xs tabular-nums text-cream/35">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl text-cream md:text-[1.7rem]">{item.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-cream/65">{item.text}</p>
              </motion.li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
