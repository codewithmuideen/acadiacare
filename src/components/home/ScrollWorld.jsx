import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import Glass from '../common/Glass'
import ImageGallery from './ImageGallery'
import { images } from '../../data/images'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ease } from '../../lib/motion'

const ScrollWorldCanvas = lazy(() => import('../three/ScrollWorldCanvas'))

const PHOTOS = [
  'knitting-group',
  'garden-independence',
  'walker-support',
  'couple-independent-living',
  'colouring-activity',
  'photo-album-home',
  'carer-shared-laugh',
  'carer-leaning-resident',
  'holding-hands-mono',
  'carer-conversation-living-room',
].map((name) => ({ name, aspect: images[name].w / images[name].h }))

/** Chapter copy restates the company's own published history. */
const CHAPTERS = [
  { kicker: 'Care & support', title: 'Everyday moments, with dignity.', text: 'Compassionate and professional care, wherever it is needed.' },
  { kicker: 'Nursing homes', title: 'For the elderly in nursing homes.', text: 'Carers and support workers who help each person retain their dignity and independence.' },
  { kicker: 'Supported living', title: 'Extra support to live independently.', text: 'Support for disabled adults who may require extra help to live independently.' },
  { kicker: 'At home', title: 'Comfort of their own home.', text: 'Care for individuals convalescing in the comfort of their own homes.' },
  { kicker: 'Staffordshire', title: 'Rooted in our community.', text: 'Providing clients with carers and support workers across Staffordshire County.' },
]

export default function ScrollWorld() {
  const reduce = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 767px)')
  const ref = useRef(null)
  const progressRef = useRef(0)
  const [chapter, setChapter] = useState(0)
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v
    setProgress(v)
    setChapter(Math.min(CHAPTERS.length - 1, Math.floor(v * CHAPTERS.length * 0.999)))
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Reduced motion: keep the calm, static gallery instead of a moving 3D scene.
  if (reduce) return <ImageGallery />

  const c = CHAPTERS[chapter]
  return (
    <section ref={ref} aria-labelledby="world-title" className="relative h-[380vh] bg-cream md:h-[500vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Soft halo behind the corridor */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#FBE8F4_0%,#F8F5F0_65%)]" />

        {active && (
          <Suspense fallback={null}>
            <ScrollWorldCanvas photos={PHOTOS} progressRef={progressRef} active={active} mobile={mobile} />
          </Suspense>
        )}

        <h2 id="world-title" className="sr-only">
          Care and support across Staffordshire
        </h2>

        {/* Chapter card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[12vh] flex justify-center px-4 md:bottom-auto md:left-[6vw] md:right-auto md:top-1/2 md:-translate-y-1/2 md:justify-start md:px-0">
          <div className="relative h-[11rem] w-full max-w-[24rem] md:w-[24rem]">
            <Glass anchorClassName="left-1/2 top-1/2" radius={28} mouseContainer={ref}>
              <div className="w-[min(24rem,calc(100vw-2rem))] px-7 py-6 font-sans">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={chapter} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease }}>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-brand-strong">
                      {String(chapter + 1).padStart(2, '0')} · {c.kicker}
                    </p>
                    <p className="mt-3 font-display text-[1.75rem] leading-tight text-ink">{c.title}</p>
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{c.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Glass>
          </div>
        </div>

        {/* Progress rail */}
        <div aria-hidden="true" className="absolute right-5 top-1/2 hidden h-48 w-px -translate-y-1/2 bg-ink/10 md:block lg:right-10">
          <div className="absolute left-0 top-0 w-px bg-brand-strong" style={{ height: `${progress * 100}%` }} />
          {CHAPTERS.map((_, i) => (
            <span
              key={i}
              className={`absolute -left-[3px] h-[7px] w-[7px] rounded-full transition-colors duration-500 ${i <= chapter ? 'bg-brand-strong' : 'bg-stone'}`}
              style={{ top: `${(i / (CHAPTERS.length - 1)) * 100}%`, transform: 'translateY(-50%)' }}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.p
          aria-hidden="true"
          className="absolute left-1/2 top-[calc(var(--header-h)+1rem)] -translate-x-1/2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted"
          animate={{ opacity: progress < 0.04 ? 1 : 0 }}
        >
          Keep scrolling
        </motion.p>
      </div>
    </section>
  )
}
