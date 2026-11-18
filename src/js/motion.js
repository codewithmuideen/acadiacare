/**
 * Motion graphics (motion.dev). Everything degrades to fully visible, static
 * content for reduced-motion users or if anything fails.
 */
import { animate, inView, scroll, stagger } from 'motion'

const EASE = [0.22, 1, 0.36, 1]
/** Animate, then pin the final visible state inline so nothing can ever stay hidden. */
function show(targets, keyframes, opts = {}) {
  const els = targets instanceof Element ? [targets] : [...targets]
  if (!els.length) return
  const finish = () => els.forEach((e) => { e.setAttribute('data-in', ''); e.style.opacity = ''; e.style.transform = '' })
  try {
    const ctl = animate(els, keyframes, opts)
    ctl?.then?.(finish)
  } catch { finish() }
  const total = ((opts.duration || 0.8) + 0.08 * els.length + 0.6) * 1000
  setTimeout(finish, total)
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const editing = () => document.documentElement.classList.contains('cms-editing')

function revealOffsets(el) {
  switch (el.dataset.reveal) {
    case 'left': return { x: [-30, 0] }
    case 'right': return { x: [30, 0] }
    case 'zoom': return { scale: [0.94, 1] }
    default: return { y: [26, 0] }
  }
}

function hero() {
  const items = document.querySelectorAll('[data-hero-in]')
  if (items.length) show(items, { opacity: [0, 1], y: [22, 0] }, { duration: 0.9, delay: stagger(0.12, { startDelay: 0.15 }), ease: EASE })
  const media = document.querySelector('[data-hero-media]')
  if (media) {
    animate(media.querySelector('.hero-phone'), { opacity: [0, 1], scale: [0.92, 1], rotate: [-3, 0] }, { duration: 1.4, delay: 0.3, ease: EASE })
    const heroEl = media.closest('.hero')
    if (window.innerWidth > 768) {
      scroll(animate(media, { y: [0, 80] }, { ease: 'linear' }), { target: heroEl, offset: ['start start', 'end start'] })
    }
  }
  const em = document.querySelector('.hero h1 em')
  if (em) animate(em, { backgroundSize: ['0% 0.14em', '100% 0.14em'] }, { duration: 1.1, delay: 0.9, ease: EASE })
}

function reveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    inView(el, () => { show(el, { opacity: [0, 1], ...revealOffsets(el) }, { duration: 0.85, ease: EASE }) }, { amount: 0.15 })
  })
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const kids = [...group.children]
    inView(group, () => { show(kids, { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, delay: stagger(0.08), ease: EASE }) }, { amount: 0.1 })
  })
}

function parallax() {
  document.querySelectorAll('[data-parallax]').forEach((img) => {
    const target = img.parentElement
    scroll(animate(img, { y: ['-6%', '6%'] }, { ease: 'linear' }), { target, offset: ['start end', 'end start'] })
  })
}

function counters() {
  document.querySelectorAll('[data-count-to]').forEach((el) => {
    const to = Number(el.dataset.countTo)
    const from = Number(el.dataset.countFrom || 0)
    const suffix = el.dataset.suffix || ''
    if (!Number.isFinite(to)) return
    inView(el, () => {
      animate(from, to, { duration: 1.8, ease: EASE, onUpdate: (v) => { el.textContent = Math.round(v) + suffix } })
    }, { amount: 0.6 })
  })
}

function progressBar() {
  const bar = document.createElement('div')
  bar.className = 'scroll-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)
  scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }))
}

function tilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  document.querySelectorAll('.svc-card, .why-card, .mc').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (editing()) return
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-6px)`
    })
    card.addEventListener('pointerleave', () => { card.style.transform = '' })
  })
}

export function initMotion() {
  if (reduced() || editing()) { document.documentElement.classList.add('no-motion'); return }
  try {
    hero(); reveals(); parallax(); counters(); progressBar(); tilt()
  } catch (err) {
    console.warn('[motion] disabled', err)
    document.documentElement.classList.add('no-motion')
  }
}
