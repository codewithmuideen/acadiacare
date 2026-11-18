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

/* Hero: plays Acadia's videos back to back, with sound toggle and dots. */
function initHeroVideo() {
  const video = document.querySelector('.hero-video')
  if (!video) return
  const list = (video.dataset.playlist || '').split(',').map((s) => s.trim()).filter(Boolean)
  const dots = [...document.querySelectorAll('.hero-dots button')]
  const sound = document.querySelector('.hero-sound')
  const current = () => list.indexOf(new URL(video.querySelector('source')?.src || video.currentSrc, location.href).pathname)
  const playIndex = (i) => {
    const src = list[i]
    if (!src) return
    const source = video.querySelector('source')
    if (source) source.src = src; else video.src = src
    video.poster = src.replace(/\.mp4$/, '-poster.jpg')
    video.load()
    video.play().catch(() => {})
    dots.forEach((d, n) => d.classList.toggle('on', n === i))
  }
  video.addEventListener('ended', () => {
    const i = current()
    if (i === -1 || list.length < 2) { video.currentTime = 0; video.play().catch(() => {}); return } // replaced in the CMS: just loop
    playIndex((i + 1) % list.length)
  })
  dots.forEach((d) => d.addEventListener('click', () => playIndex(Number(d.dataset.i))))
  if (list.length < 2) dots.forEach((d) => { d.hidden = true })
  sound?.addEventListener('click', () => {
    video.muted = !video.muted
    if (!video.muted) video.play().catch(() => {})
    sound.setAttribute('aria-pressed', String(!video.muted))
    sound.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off')
  })
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause() }).observe(video)
  }
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
