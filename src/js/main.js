import { initCms, restSelect, pageName } from './cms.js'
import { initMotion } from './motion.js'
import { initContactForms } from './forms.js'
import { initApplication } from './application.js'
import { hasStoredSession } from './supabase.js'
import { CMS_ENABLED } from './config.js'
import { sanitize, escapeHtml } from './sanitize.js'

/* ---------- navigation ---------- */
function initNav() {
  const nav = document.getElementById('mainNav')
  const burger = document.getElementById('burger')
  const mob = document.getElementById('mobNav')
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 20)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  const close = () => { mob?.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false') }
  burger?.addEventListener('click', () => {
    const open = !mob.classList.contains('open')
    mob.classList.toggle('open', open)
    burger.setAttribute('aria-expanded', String(open))
  })
  mob?.addEventListener('click', (e) => { if (e.target.closest('a')) close() })
  document.addEventListener('click', (e) => { if (!e.target.closest('header')) close() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
}

/* ---------- WhatsApp widget ---------- */
function initWhatsApp() {
  const pop = document.getElementById('waPop')
  const fab = document.getElementById('waFab')
  const set = (open) => { pop?.classList.toggle('open', open); fab?.setAttribute('aria-expanded', String(open)) }
  fab?.addEventListener('click', () => set(!pop.classList.contains('open')))
  document.getElementById('waClose')?.addEventListener('click', () => set(false))
}

/* ---------- video cards ---------- */
function initVideos() {
  document.querySelectorAll('[data-video]').forEach((wrap) => {
    const video = wrap.querySelector('video')
    const btn = wrap.querySelector('.vid-play')
    btn?.addEventListener('click', () => { video.play(); wrap.classList.add('playing') })
    video.addEventListener('play', () => {
      wrap.classList.add('playing')
      document.querySelectorAll('[data-video] video').forEach((v) => { if (v !== video) v.pause() })
    })
    video.addEventListener('pause', () => { if (video.currentTime === 0 || video.ended) wrap.classList.remove('playing') })
  })
  initHeroVideo()
}

/* Hero: cinematic background video + "Watch our films" lightbox (full videos, with sound). */
function initHeroVideo() {
  const bg = document.querySelector('.hero-video')
  if (bg && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) bg.play().catch(() => {}); else bg.pause() }).observe(bg)
  }
  const triggers = document.querySelectorAll('[data-film]')
  if (!triggers.length) return
  const box = document.createElement('div')
  box.className = 'film-box'
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-modal', 'true')
  box.setAttribute('aria-label', 'Acadia Care film')
  box.hidden = true
  box.innerHTML = '<div class="film-inner"><button class="film-close" type="button" aria-label="Close video"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button><video controls playsinline></video><div class="film-tabs"></div></div>'
  document.body.appendChild(box)
  const video = box.querySelector('video')
  const tabs = box.querySelector('.film-tabs')
  const films = [...triggers].filter((t) => t.dataset.film && t.dataset.filmTitle)
  const unique = [...new Map(films.map((t) => [t.dataset.film, t])).values()]
  tabs.innerHTML = unique.map((t, i) => `<button type="button" data-i="${i}">${t.dataset.filmTitle}</button>`).join('')
  let last = null
  const play = (src, poster) => {
    video.src = src
    if (poster) video.poster = poster
    video.play().catch(() => {})
    tabs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', unique[i].dataset.film === src))
  }
  const open = (t) => {
    last = document.activeElement
    box.hidden = false
    document.documentElement.classList.add('film-open')
    bg?.pause()
    play(t.dataset.film, t.dataset.filmPoster)
    box.querySelector('.film-close').focus()
  }
  const close = () => {
    video.pause()
    box.hidden = true
    document.documentElement.classList.remove('film-open')
    bg?.play().catch(() => {})
    last?.focus?.()
  }
  triggers.forEach((t) => t.addEventListener('click', (e) => {
    if (document.documentElement.classList.contains('cms-editing')) return
    e.preventDefault()
    open(t.dataset.film ? t : unique[0])
  }))
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { const t = unique[+b.dataset.i]; play(t.dataset.film, t.dataset.filmPoster) } })
  video.addEventListener('ended', () => {
    const i = unique.findIndex((t) => t.dataset.film === video.getAttribute('src'))
    if (i > -1 && i < unique.length - 1) play(unique[i + 1].dataset.film, unique[i + 1].dataset.filmPoster)
  })
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.film-close')) close() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close() })
}

/* ---------- custom CMS pages (/p/slug or /page?p=slug) ---------- */
async function initCustomPage() {
  if (pageName() !== 'custom') return
  const slug = (new URLSearchParams(location.search).get('p') || location.pathname.replace(/^\/p\//, '').replace(/\/$/, '')).toLowerCase().replace(/[^a-z0-9-]/g, '')
  const title = document.getElementById('cpTitle')
  const body = document.getElementById('cpBody')
  const notFound = () => {
    title.textContent = 'Page not found'
    body.innerHTML = '<div class="empty-state"><p>This page does not exist or has not been published yet.</p><p class="mt16"><a class="btn btn-pink" href="/"><span>Go to Home</span></a></p></div>'
  }
  if (!CMS_ENABLED || !slug) return notFound()
  try {
    const rows = await restSelect('pages', `select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`)
    const page = rows[0]
    if (!page) return notFound()
    document.title = `${page.title} | Acadia Care`
    const meta = document.querySelector('meta[name="description"]')
    if (meta && page.meta_description) meta.content = page.meta_description
    title.textContent = page.title
    document.getElementById('cpCrumb').textContent = page.title
    document.getElementById('cpIntro').textContent = page.intro || ''
    body.innerHTML = sanitize(page.body || '', 'block') || `<p>${escapeHtml('')}</p>`
    document.documentElement.dataset.customSlug = slug
  } catch (err) {
    console.error(err)
    notFound()
  }
}

/* ---------- boot ---------- */
async function boot() {
  initNav()
  initWhatsApp()
  initVideos()
  initContactForms()
  initApplication()
  const cmsReady = initCms() // applies cached content synchronously, refreshes in the background
  const customReady = initCustomPage()
  initMotion()
  // Signed-in admins get the inline editor (loaded only for them).
  if (CMS_ENABLED && hasStoredSession()) {
    await Promise.allSettled([cmsReady, customReady])
    import('./editor.js').then((m) => m.startEditor()).catch((err) => console.warn('[editor]', err))
  }
}

boot()
