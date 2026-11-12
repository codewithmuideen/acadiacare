import { motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import Container from './Container'
import Breadcrumbs from './Breadcrumbs'
import SplitText from './SplitText'
import Img from './Img'
import { ImageReveal } from './Reveal'
import { ease } from '../../lib/motion'

/**
 * Inner-page hero: editorial headline left, photograph right,
 * framed in a landscape card so the whole photograph stays visible.
 */
export default function PageHero({ eyebrow, title, intro, image, imagePosition, breadcrumbs, children }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
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
          <div className="relative pb-6 sm:pb-8 lg:col-span-5">
            {/* Soft tinted backdrop, kept inside the column so nothing is clipped */}
            <div aria-hidden="true" className="absolute inset-x-6 bottom-0 top-10 rounded-[2rem] bg-brand-tint sm:inset-x-10" />
            <ImageReveal
              immediate
              delay={0.2}
              className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sand shadow-[0_40px_80px_-40px_rgb(31_26_23/0.45)] ring-1 ring-ink/5"
            >
              <Img name={image} priority sizes="(min-width: 1024px) 40vw, 92vw" position={imagePosition} />
            </ImageReveal>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.9 }}
              className="absolute bottom-0 left-4 flex items-center gap-3 rounded-full bg-white/95 py-2 pl-2 pr-5 shadow-[0_16px_40px_-16px_rgb(31_26_23/0.35)] backdrop-blur sm:left-6"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-strong text-white">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-ink">Registered with the CQC</span>
            </motion.div>
          </div>
        )}
      </Container>
    </section>
  )
}
