import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Phone, Play } from 'lucide-react'
import Container from '../common/Container'
import Button from '../common/Button'
import SplitText from '../common/SplitText'
import Img from '../common/Img'
import Glass from '../common/Glass'
import CqcBadge from '../common/CqcBadge'
import { primaryPhone } from '../../data/site'
import { ease } from '../../lib/motion'
import { cn } from '../../lib/cn'

const HeroCanvas = lazy(() => import('../three/HeroCanvas'))
const HeroGradient = lazy(() => import('../three/HeroGradient'))

const SLIDES = [
  {
    name: 'carer-embrace-wheelchair',
    focus: [0.74, 0.4],
    tag: 'Residential care support',
    title: 'Individually focused care for the elderly and young alike.',
  },
  {
    name: 'carer-breakfast-home-visit',
    focus: [0.62, 0.45],
    tag: 'Domiciliary care',
    title: 'Helping people remain in the comfort of their own home.',
  },
  {
    name: 'care-professional-home-visit',
    focus: [0.55, 0.32],
    tag: 'Professionally trained staff',
    title: 'Qualified, experienced and vetted through Enhanced DBS.',
  },
  {
    name: 'carer-laughing-resident',
    focus: [0.38, 0.45],
    tag: 'Person-centred approach',
    title: 'The client’s utmost needs at the heart of our approach.',
  },
  {
    name: 'social-activity-dancing',
    focus: [0.5, 0.45],
    tag: 'Dignity & independence',
    title: 'Care that respects dignity and accepts your choice of care.',
  },
]

const AUTOPLAY_MS = 6500
// Where each automatic transition blooms from (stage coordinates, y up)
const BLOOM_SPOTS = [
  { x: 0.25, y: 0.3 },
  { x: 0.8, y: 0.75 },
  { x: 0.5, y: 0.5 },
  { x: 0.2, y: 0.8 },
  { x: 0.75, y: 0.25 },
]

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

/** Progress ring drawn around the active thumbnail. */
function Ring({ running, duration }) {
  return (
    <svg viewBox="0 0 44 44" className="pointer-events-none absolute -inset-[5px] h-[calc(100%+10px)] w-[calc(100%+10px)] -rotate-90" aria-hidden="true">
      <circle cx="22" cy="22" r="20.5" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.5" />
      <motion.circle
        cx="22"
        cy="22"
        r="20.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: 1 }}
        animate={{ strokeDashoffset: running ? 0 : 1 }}
        transition={{ duration: running ? duration / 1000 : 0.2, ease: 'linear' }}
      />
    </svg>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [inView, setInView] = useState(true)
  const [gl, setGl] = useState(false)
  const [glReady, setGlReady] = useState(false)
  const [userNav, setUserNav] = useState(false)

  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const pointer = useRef({ x: 0.5, y: 0.5, inside: false })
  const origin = useRef({ x: 0.5, y: 0.5 })
  const drag = useRef(null)

  // Mount the WebGL layers after first paint so they never delay the LCP image.
  useEffect(() => {
    if (reduce) return
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300))
    const cancel = window.cancelIdleCallback || clearTimeout
    const id = idle(() => setGl(webglAvailable()))
    return () => cancel(id)
  }, [reduce])

  // Pause everything while the hero is off screen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const go = useCallback((next, from) => {
    origin.current = from ?? { x: 0.5, y: 0.5 }
    setIndex((next + SLIDES.length) % SLIDES.length)
  }, [])

  const running = playing && !hovering && inView && !reduce
  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => go(index + 1, BLOOM_SPOTS[index % BLOOM_SPOTS.length]), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [running, index, go])

  const toLocal = (e) => {
    const r = stageRef.current.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height }
  }
  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse') pointer.current = { ...toLocal(e), inside: true }
  }
  const onPointerDown = (e) => {
    if (e.target.closest('button,a')) return
    drag.current = { x: e.clientX, y: e.clientY, at: toLocal(e) }
  }
  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    if (!d || e.target.closest('button,a')) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 40) {
      setUserNav(true)
      go(index + (dx < 0 ? 1 : -1), toLocal(e))
    } else if (Math.abs(e.clientY - d.y) < 10 && Math.abs(dx) < 10) {
      setUserNav(true)
      go(index + 1, d.at)
    }
  }
  const manual = (i) => {
    setUserNav(true)
    go(i)
  }

  const slide = SLIDES[index]
  const appear = (delay) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease, delay },
  })

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-h)+1.5rem)] lg:flex lg:min-h-[100svh] lg:items-center lg:pb-10 lg:pt-[calc(var(--header-h)+1rem)]"
    >
      {/* Living gradient backdrop (ShaderGradient), with a CSS gradient underneath */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_15%,#F7D3EA_0%,#F8F5F0_60%)]">
        {gl && inView && (
          <Suspense fallback={null}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }}>
              <HeroGradient />
            </motion.div>
          </Suspense>
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream to-transparent" />
      </div>

      <Container className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-10">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-5">
          <motion.p className="eyebrow mb-7" {...appear(0.05)}>
            Acadia Support Services · Staffordshire
          </motion.p>
          <SplitText
            as="h1"
            id="hero-title"
            inView={false}
            delay={0.12}
            stagger={0.07}
            className="text-display-xl !leading-[1.04] text-ink"
            parts={[{ text: 'Care that', break: true }, { text: 'puts' }, { text: 'people', className: 'italic text-brand-strong' }, { text: 'first.' }]}
          />
          <motion.p className="lede mt-8 max-w-lg" {...appear(0.55)}>
            Designed to provide the highest standard of care across the whole social care spectrum, from residential care
            support and domiciliary care to the professional recruitment of support workers and carers.
          </motion.p>
          <motion.div className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap" {...appear(0.7)}>
            <Button to="/services" size="lg">
              Explore our services
            </Button>
            <Button to="/contact-acadia-care" variant="outline" size="lg" className="bg-cream/40 backdrop-blur">
              Talk to our team
            </Button>
          </motion.div>
          <motion.div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6" {...appear(0.85)}>
            <CqcBadge />
            <a href={primaryPhone.href} className="group flex items-center gap-3 px-1">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-cream transition-colors group-hover:bg-brand-strong">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.16em] text-muted">Call our Stafford office</span>
                <span className="font-semibold text-ink">{primaryPhone.label}</span>
              </span>
            </a>
          </motion.div>
        </div>

        {/* Image portal */}
        <motion.div
          className="relative lg:col-span-7"
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease, delay: 0.2 }}
        >
          <div
            ref={stageRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Acadia Care in pictures"
            onPointerMove={onPointerMove}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => {
              setHovering(false)
              pointer.current = { ...pointer.current, inside: false }
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="relative h-[72svh] max-h-[640px] min-h-[460px] cursor-pointer touch-pan-y select-none overflow-hidden bg-sand shadow-[0_50px_100px_-40px_rgb(31_26_23/0.45)] [border-radius:8rem_1.75rem_1.75rem_1.75rem] sm:[border-radius:14rem_2.5rem_2.5rem_2.5rem] lg:h-[calc(100svh-var(--header-h)-3.5rem)] lg:max-h-[860px]"
          >
            {/* Static layer: LCP image, and the full experience for reduced motion / no WebGL */}
            <div className={cn('absolute inset-0 transition-opacity duration-700', glReady && 'opacity-0')}>
              {SLIDES.map((s, i) => (
                <motion.div
                  key={s.name}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.04 }}
                  transition={{ duration: reduce ? 0.3 : 1.1, ease }}
                  aria-hidden={i === index ? undefined : 'true'}
                >
                  <Img name={s.name} priority={i === 0} sizes="(min-width: 1024px) 58vw, 100vw" position={`${s.focus[0] * 100}% ${s.focus[1] * 100}%`} />
                </motion.div>
              ))}
            </div>

            {/* WebGL liquid transition layer (React Three Fiber) */}
            {gl && (
              <Suspense fallback={null}>
                <div className={cn('absolute inset-0 transition-opacity duration-700', glReady ? 'opacity-100' : 'opacity-0')}>
                  <HeroCanvas slides={SLIDES} index={index} pointer={pointer} origin={origin} active={inView} onReady={() => setGlReady(true)} />
                </div>
              </Suspense>
            )}

            {/* Legibility veil */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-ink/10" />

            {/* Counter */}
            <div className="pointer-events-none absolute right-6 top-6 flex items-baseline gap-2 font-display text-cream [text-shadow:0_2px_16px_rgb(0_0_0/0.3)] sm:right-8 sm:top-8" aria-hidden="true">
              <span className="relative inline-block h-[1em] overflow-hidden text-5xl leading-none sm:text-6xl">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={index} className="block" initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: 0.8, ease }}>
                    {String(index + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-xl opacity-75">/ {String(SLIDES.length).padStart(2, '0')}</span>
            </div>

            {/* Caption (liquid glass) */}
            <div className="pointer-events-none absolute bottom-[6.75rem] left-5 right-5 h-[8.25rem] sm:bottom-28 sm:left-8 sm:right-auto sm:w-[26rem]">
              <Glass anchorClassName="left-1/2 top-1/2" radius={26} mouseContainer={stageRef}>
                <div className="w-[calc(100vw-4.5rem)] px-6 py-5 font-sans text-white sm:w-[26rem]" aria-live={userNav ? 'polite' : 'off'} aria-atomic="true">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease }}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/90">{slide.tag}</p>
                      <p className="mt-2 font-display text-[1.4rem] leading-snug text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.3)] sm:text-[1.6rem]">{slide.title}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Glass>
            </div>

            {/* Navigator (liquid glass) */}
            <Glass anchorClassName="bottom-[3.25rem] left-1/2 sm:bottom-14" radius={999} mouseContainer={stageRef} strong>
              <div className="flex items-center gap-1 px-2 py-2 font-sans text-white sm:gap-2 sm:px-2.5">
                <button type="button" onClick={() => manual(index - 1)} className="hidden h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/20 xs:grid" aria-label="Previous photo">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-2 px-1 sm:gap-2.5">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => manual(i)}
                      aria-label={`Show photo ${i + 1}: ${s.tag}`}
                      aria-current={i === index ? 'true' : undefined}
                      className={cn(
                        'relative h-7 w-7 shrink-0 rounded-full transition-all duration-500 ease-soft xs:h-8 xs:w-8 sm:h-9 sm:w-9',
                        i === index ? 'scale-110' : 'opacity-70 hover:scale-105 hover:opacity-100',
                      )}
                    >
                      <span className="block h-full w-full overflow-hidden rounded-full">
                        <img
                          src={`/assets/images/${s.name}-480.webp`}
                          alt=""
                          width="36"
                          height="36"
                          loading="lazy"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: `${s.focus[0] * 100}% ${s.focus[1] * 100}%` }}
                        />
                      </span>
                      {i === index && <Ring key={`${index}-${running}`} running={running} duration={AUTOPLAY_MS} />}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => manual(index + 1)} className="hidden h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/20 xs:grid" aria-label="Next photo">
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                {!reduce && (
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/30 transition-colors hover:bg-white/20"
                    aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                  >
                    {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                )}
              </div>
            </Glass>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
