import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import Container from '../common/Container'
import Reveal, { ImageReveal } from '../common/Reveal'
import SplitText from '../common/SplitText'
import Img from '../common/Img'
import { TextLink } from '../common/Button'
import { history, whoWeAre } from '../../data/site'

export default function AboutPreview() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yearX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%'])
  const smallY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60])

  return (
    <section ref={ref} aria-labelledby="about-preview-title" className="relative overflow-hidden bg-sand py-24 md:py-36">
      {/* Oversized outline year */}
      <motion.p
        aria-hidden="true"
        style={{ x: yearX }}
        className="text-outline pointer-events-none absolute -top-6 left-0 select-none whitespace-nowrap font-display text-[32vw] leading-none md:text-[22vw]"
      >
        Est. 2013
      </motion.p>

      <Container className="relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="relative order-2 lg:order-1 lg:col-span-6">
          <div className="relative mr-10 sm:mr-24">
            <ImageReveal className="aspect-[4/5] overflow-hidden rounded-[2rem]" direction="right">
              <Img name="carer-breakfast-home-visit" sizes="(min-width: 1024px) 40vw, 85vw" position="45% 50%" />
            </ImageReveal>
            <motion.div style={{ y: smallY }} className="absolute -bottom-10 -right-10 w-1/2 sm:-right-20">
              <div className="overflow-hidden rounded-full border-[6px] border-sand">
                <Img name="holding-hands-mono" sizes="(min-width: 1024px) 20vw, 45vw" className="aspect-square" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6 lg:pl-8">
          <Reveal>
            <p className="eyebrow mb-6">Our story</p>
          </Reveal>
          <SplitText
            id="about-preview-title"
            className="text-display-md"
            parts={[{ text: 'Established in 2013 in' }, { text: 'Buckinghamshire,', className: 'italic text-brand-strong' }, { text: 'England.' }]}
          />
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-ink-soft">{history.p1}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 leading-relaxed text-muted">{whoWeAre.tailored}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-ink/10 pt-8">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Founded</dt>
                <dd className="mt-2 font-display text-3xl text-ink">2013</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Offices</dt>
                <dd className="mt-2 font-display text-3xl text-ink">Stafford &amp; Kent</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.25} className="mt-10">
            <TextLink to="/about-acadia-care">Discover our story</TextLink>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
