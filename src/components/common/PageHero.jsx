import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import Container from './Container'
import Breadcrumbs from './Breadcrumbs'
import SplitText from './SplitText'
import Img from './Img'
import { ImageReveal } from './Reveal'
import { ease } from '../../lib/motion'

/**
 * Inner-page hero: editorial headline left, arched photograph right,
 * with a subtle parallax on the image.
 */
export default function PageHero({ eyebrow, title, intro, image, imagePosition, breadcrumbs, children }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-tint blur-3xl" />
      <Container className="relative grid items-end gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease }}>
            <Breadcrumbs items={breadcrumbs} className="mb-10" />
          </motion.div>
          {eyebrow && (
            <motion.p
              className="eyebrow mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
            >
              {eyebrow}
            </motion.p>
          )}
          <SplitText as="h1" parts={title} inView={false} delay={0.15} className="text-display-lg" />
          {intro && (
            <motion.p
              className="lede mt-8 max-w-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.45 }}
            >
              {intro}
            </motion.p>
          )}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.6 }}
              className="mt-10"
            >
              {children}
            </motion.div>
          )}
        </div>
        {image && (
          <div className="relative lg:col-span-5">
            <ImageReveal immediate delay={0.2} className="relative aspect-[4/5] overflow-hidden rounded-arch sm:aspect-[5/4] lg:aspect-[4/5]">
              <motion.div style={{ y }} className="h-[112%] w-full">
                <Img name={image} priority sizes="(min-width: 1024px) 38vw, 92vw" position={imagePosition} />
              </motion.div>
            </ImageReveal>
            <div aria-hidden="true" className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-arch border border-brand-strong/25" />
          </div>
        )}
      </Container>
    </section>
  )
}
