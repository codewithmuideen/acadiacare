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
  initScrollPlay()
}

/* Films marked data-scroll-play start by themselves (with sound where the
   browser allows) when scrolled into view, and pause when scrolled away. */
function initScrollPlay() {
  document.querySelectorAll('[data-scroll-play]').forEach((wrap) => {
    const v = wrap.querySelector('video')
    const soundBtn = wrap.querySelector('.sp-sound')
    let userPaused = false
    let auto = false
    const sync = () => { if (soundBtn) soundBtn.hidden = !v.muted || v.paused }
    const start = () => {
      if (v.preload === 'none') v.preload = 'auto'
      auto = true
      v.muted = false
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}) }).finally(() => { auto = false; sync() })
    }
    const unmute = () => { v.muted = false; v.play().catch(() => {}); sync() }
    soundBtn?.addEventListener('click', (e) => { e.stopPropagation(); unmute() })
    v.addEventListener('volumechange', sync)
    v.addEventListener('play', sync)
    v.addEventListener('pause', () => { if (!auto && !v.ended && document.visibilityState === 'visible' && wrap.dataset.inView === '1') userPaused = true; sync() })
    v.addEventListener('ended', () => { userPaused = true })
    if (!('IntersectionObserver' in window)) return
    // Start fetching a little before it arrives so it plays instantly.
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { v.preload = 'auto'; o.disconnect() } }, { rootMargin: '600px 0px' }).observe(wrap)
    new IntersectionObserver(([e]) => {
      wrap.dataset.inView = e.isIntersecting ? '1' : '0'
      if (e.isIntersecting) { if (!userPaused && !document.getElementById('welcomeFilm')) start() } else if (!v.paused) { auto = true; v.pause(); auto = false }
    }, { threshold: 0.5 }).observe(wrap)
    // If the welcome film was open while this was on screen, start once it closes.
    addEventListener('welcomefilm:closed', () => { if (wrap.dataset.inView === '1' && !userPaused) start() })
  })
}

/* Hero: cinematic background video + "Watch our films" lightbox (full videos, with sound). */
function initHeroVideo() {
  const bg = document.querySelector('.hero-video')
  if (bg) initHeroPlaylist(bg)
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
  tabs.hidden = unique.length < 2
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

/* Welcome film: hero-video opens full screen first (with sound when the
   browser allows it, otherwise muted until the first tap). Closing it, or
   letting it finish, reveals the hero with hero-video as the background. */
function initHeroPlaylist(bg) {
  const startBg = () => {
    if (bg.preload === 'none') { bg.preload = 'auto'; bg.load() }
    bg.play().catch(() => {})
  }
  let visible = true
  let modalOpen = false
  const box = document.getElementById('welcomeFilm')
  const editing = document.documentElement.classList.contains('cms-editing') || /[?&]edit/.test(location.search)
  if (box && !editing) {
    modalOpen = true
    const v = box.querySelector('video')
    const soundBtn = box.querySelector('.wf-sound')
    document.documentElement.classList.add('film-open')
    const sync = () => { soundBtn.hidden = !v.muted }
    const unmute = () => {
      if (!v.muted) return
      v.muted = false
      v.play().then(sync).catch(() => { v.muted = true; sync(); v.play().catch(() => {}) })
    }
    const close = () => {
      if (!modalOpen) return
      modalOpen = false
      v.pause()
      box.classList.add('closing')
      setTimeout(() => box.remove(), 350)
      document.documentElement.classList.remove('film-open')
      removeEventListener('keydown', onKey)
      if (visible) startBg()
      setTimeout(() => dispatchEvent(new Event('welcomefilm:closed')), 360)
    }
    const onKey = (e) => { if (e.key === 'Escape') close(); else unmute() }
    addEventListener('keydown', onKey)
    box.querySelector('.wf-close').addEventListener('click', close)
    soundBtn.addEventListener('click', unmute)
    box.addEventListener('pointerdown', (e) => { if (!e.target.closest('.wf-close')) unmute() })
    v.addEventListener('volumechange', sync)
    v.addEventListener('ended', close)
    // Try with sound straight away; fall back to muted if the browser blocks it.
    const policy = navigator.getAutoplayPolicy?.(v)
    if (policy !== 'allowed-muted' && policy !== 'disallowed') unmute()
    sync()
    v.play().catch(() => {})
    box.querySelector('.wf-close').focus({ preventScroll: true })
  } else {
    box?.remove()
    startBg()
  }

  // Hero background pauses when scrolled away or the tab is hidden.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (modalOpen) return; if (visible) startBg(); else bg.pause() }).observe(bg)
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) bg.pause(); else if (visible && !modalOpen) startBg() })
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
