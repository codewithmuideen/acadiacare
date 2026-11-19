/**
 * Motion graphics (motion.dev). Style: soft blur-in reveals, word-by-word
 * headings, clip-path image wipes, popping icons and sticky stacking cards.
 * Everything degrades to fully visible, static content for reduced-motion
 * users, in the editor, or if anything fails.
 */
import { animate, inView, scroll, stagger } from 'motion'

const EASE = [0.16, 1, 0.3, 1]

/** Animate, then mark as revealed and clear inline styles so nothing can stay hidden. */
function show(targets, keyframes, opts = {}) {
  const els = targets instanceof Element ? [targets] : [...targets]
  if (!els.length) return
  const finish = () => els.forEach((e) => { e.setAttribute('data-in', ''); e.style.opacity = ''; e.style.transform = ''; e.style.filter = ''; e.style.clipPath = '' })
  try {
    const ctl = animate(els, keyframes, opts)
    ctl?.then?.(finish)
  } catch { finish() }
  const total = ((opts.duration || 0.8) + 0.08 * els.length + 0.8) * 1000
  setTimeout(finish, total)
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const editing = () => document.documentElement.classList.contains('cms-editing')

function revealOffsets(el) {
  switch (el.dataset.reveal) {
    case 'left': return window.innerWidth < 1025 ? { y: [34, 0] } : { x: [-40, 0] }
    case 'right': return window.innerWidth < 1025 ? { y: [34, 0] } : { x: [40, 0] }
    case 'zoom': return { scale: [0.92, 1] }
    default: return { y: [34, 0] }
  }
}

/* ---------- word-by-word headings ---------- */
const split = []
function splitWords(el) {
  if (el.dataset.split) return []
  el.dataset.split = '1'
  split.push({ el, html: el.innerHTML })
  const words = []
  const walk = (node) => {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment()
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
          const w = document.createElement('span'); w.className = 'w'
          const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part
          w.appendChild(wi); frag.appendChild(w); words.push(wi)
        })
        child.replaceWith(frag)
      } else if (child.nodeType === 1 && !child.matches('svg')) walk(child)
    })
  }
  walk(el)
  return words
}
/** Restores headings to their original HTML (used by the editor before editing). */
export function unsplitAll() {
  split.splice(0).forEach(({ el, html }) => { el.innerHTML = html; delete el.dataset.split })
}
window.__acadiaUnsplit = unsplitAll

function headings() {
  document.querySelectorAll('main .sec h2, main .mission-band h2, main .stack-txt h3, main .cta-sec h2').forEach((h) => {
    if (h.closest('form, [data-noedit-zone]')) return
    const words = splitWords(h)
    if (!words.length) return
    words.forEach((w) => { w.style.transform = 'translateY(110%)' })
    inView(h, () => {
      show(words, { y: ['110%', '0%'], rotate: [4, 0] }, { duration: 0.9, delay: stagger(0.045), ease: EASE })
    }, { amount: 0.4 })
  })
}

/* ---------- hero ---------- */
function hero() {
  const items = document.querySelectorAll('[data-hero-in]')
  if (items.length) show(items, { opacity: [0, 1], y: [30, 0], filter: ['blur(10px)', 'blur(0px)'] }, { duration: 1, delay: stagger(0.12, { startDelay: 0.2 }), ease: EASE })
  const media = document.querySelector('[data-hero-media]')
  if (media) {
    animate(media, { opacity: [0, 1], scale: [1.14, 1] }, { duration: 2.4, ease: EASE })
    const heroEl = media.closest('.hero')
    if (window.innerWidth > 768) scroll(animate(media, { y: [0, 140] }, { ease: 'linear' }), { target: heroEl, offset: ['start start', 'end start'] })
  }
  const em = document.querySelector('.hero h1 em')
  if (em) animate(em, { backgroundSize: ['0% 0.12em', '100% 0.12em'] }, { duration: 1.2, delay: 1, ease: EASE })
}

/* ---------- blur-in reveals + staggered groups ---------- */
function reveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    inView(el, () => { show(el, { opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'], ...revealOffsets(el) }, { duration: 1, ease: EASE }) }, { amount: 0.15 })
  })
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const kids = [...group.children]
    inView(group, () => { show(kids, { opacity: [0, 1], y: [40, 0], scale: [0.96, 1], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.9, delay: stagger(0.08), ease: EASE }) }, { amount: 0.1 })
  })
}

/* ---------- clip-path image wipes ---------- */
function imageWipes() {
  document.querySelectorAll('.ab-img-wrap img, .rec-media img, .sd-media img, .stack-img img, .vid-thumb').forEach((img) => {
    img.classList.add('reveal-img')
    // Observe the container: a fully clipped element reports zero visible area and would never fire.
    inView(img.parentElement, () => { show(img, { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 1.3, ease: [0.19, 1, 0.22, 1] }) }, { amount: 0.2 })
  })
}

/* ---------- popping icons ---------- */
function icons() {
  document.querySelectorAll('.svc-icon, .why-ic, .mc-i, .vc-i, .cd-ic, .cb .ic, .cta-ic').forEach((ic) => {
    inView(ic, () => { animate(ic, { opacity: [0, 1], scale: [0.6, 1], rotate: [-14, 0] }, { duration: 0.9, delay: 0.15, ease: EASE }) }, { amount: 0.6 })
  })
}

/* ---------- sticky stacking cards ---------- */
function stackCards() {
  const cards = [...document.querySelectorAll('[data-stack] .stack-card')]
  cards.forEach((card, i) => {
    const next = cards[i + 1]
    if (!next) return
    const depth = cards.length - i
    scroll(animate(card, { scale: [1, 1 - depth * 0.025], filter: ['brightness(1)', 'brightness(0.86)'] }, { ease: 'linear' }), { target: next, offset: ['start end', 'start start'] })
  })
}

function parallax() {
  document.querySelectorAll('[data-parallax]').forEach((img) => {
    scroll(animate(img, { y: ['-6%', '6%'] }, { ease: 'linear' }), { target: img.parentElement, offset: ['start end', 'end start'] })
  })
}

function counters() {
  document.querySelectorAll('[data-count-to]').forEach((el) => {
    const to = Number(el.dataset.countTo)
    const from = Number(el.dataset.countFrom || 0)
    const suffix = el.dataset.suffix || ''
    if (!Number.isFinite(to)) return
    inView(el, () => { animate(from, to, { duration: 1.8, ease: EASE, onUpdate: (v) => { el.textContent = Math.round(v) + suffix } }) }, { amount: 0.6 })
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
  // Soft pink glow that follows the cursor across cards
  document.querySelectorAll('.svc-card, .why-card, .vc, .sccard').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    })
    card.addEventListener('pointerleave', () => { card.style.setProperty('--my', '-40%') })
  })
}

/** Magnetic buttons: primary CTAs drift slightly towards the cursor. */
function magnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  document.querySelectorAll('.hero-ctas .btn, .cta-btns .btn, .nav-cta').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect()
      b.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 10}px, ${((e.clientY - r.top) / r.height - 0.5) * 8}px)`
    })
    b.addEventListener('pointerleave', () => { b.style.transform = '' })
  })
}

export function initMotion() {
  if (reduced() || editing()) { document.documentElement.classList.add('no-motion'); return }
  const steps = [hero, headings, reveals, imageWipes, icons, stackCards, parallax, counters, progressBar, tilt, magnetic]
  for (const step of steps) {
    try { step() } catch (err) { console.warn('[motion]', step.name, err) }
  }
}
