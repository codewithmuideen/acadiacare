import { initCms, restSelect, pageName } from './cms.js'
import { initMotion } from './motion.js'
import { initContactForms } from './forms.js'
import { initApplication } from './application.js'
import { hasStoredSession } from './supabase.js'
import { CMS_ENABLED } from './config.js'
import { sanitize, escapeHtml } from './sanitize.js'
import { initConsent } from './consent.js'

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

/* Hero: the only video on the site. Plays muted on a loop as the background,
   pausing while scrolled out of view or when the tab is hidden. */
function initHeroVideo() {
  const bg = document.querySelector('.hero-video')
  if (!bg) return
  let visible = true
  const start = () => bg.play().catch(() => {})
  start()
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else bg.pause() }).observe(bg)
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) bg.pause(); else if (visible) start() })
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
    // SEO: canonical + social tags for this custom page
    const setTag = (selector, create, attr, value) => {
      let el = document.head.querySelector(selector)
      if (!el) { el = document.createElement(create.tag); Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v)); document.head.appendChild(el) }
      el.setAttribute(attr, value)
    }
    const canonical = `https://acadiacare.co.uk/p/${slug}`
    setTag('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' } }, 'href', canonical)
    setTag('meta[property="og:url"]', { tag: 'meta', attrs: { property: 'og:url' } }, 'content', canonical)
    setTag('meta[property="og:title"]', { tag: 'meta', attrs: { property: 'og:title' } }, 'content', `${page.title} | Acadia Care`)
    if (page.meta_description) setTag('meta[property="og:description"]', { tag: 'meta', attrs: { property: 'og:description' } }, 'content', page.meta_description)
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
/* Full-image frames: the blurred backdrop is a copy of the frame's own photo. */
function initFitFrames() {
  document.querySelectorAll('.fit-frame').forEach((frame) => {
    const img = frame.querySelector('img')
    if (!img) return
    const set = () => frame.style.setProperty('--bg', `url("${img.currentSrc || img.src}")`)
    set()
    img.addEventListener('load', set)
  })
}

async function boot() {
  initConsent()
  initFitFrames()
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
