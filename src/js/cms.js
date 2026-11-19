/**
 * Acadia CMS runtime (public side).
 *
 * Every section in the HTML carries data-s="<scope>". Inside each scope, editable
 * text, images and videos are keyed automatically in document order
 * ("home-hero:t2", "home-about:i0"...). Each saved override stores a hash of the
 * ORIGINAL content, so if the HTML is later changed by a developer an override can
 * never land on the wrong element: it is simply skipped.
 *
 * Storage (Supabase table site_content):
 *   key "global"       → { settings, nav, cta, blocks }   (header, footer, WhatsApp widget)
 *   key "page:<name>"  → { blocks }
 */
import { SUPABASE_URL, SUPABASE_KEY, CMS_ENABLED, CACHE_KEY, DEFAULT_SETTINGS, DEFAULT_NAV, DEFAULT_CTA } from './config.js'
import { sanitize, safeUrl, escapeHtml } from './sanitize.js'

export const TEXT_SEL = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'li', 'blockquote', 'td', '.eyebrow', '.pill', '.svc-tag', '.hs-num', '.hs-label',
  '.btn > span', '.svc-link > span', '.wa-go > span', '.ti strong', '.ti span', '.img-badge strong', '.img-badge span',
  '.cb strong', '.cb span', '.rl-inner span', '.rl-inner small', '.rl-badge', '.rc-lbl', '.tc-name', '.tc-role', '.tc-av',
  '.role-name', '.role-badge', '.ap-row > span', '.counter strong', '.counter span', '.wa-pname', '.wa-pstatus', '.hero-pill > span:not(.dot)',
  '.bc > span', '.fc ul a', '.fbot-links a', '.why-n',
].join(',')

const EXCLUDE = '[data-noedit],[data-noedit-zone],[data-nav],.ic,svg,form,script,.hero-scroll'

export const pageName = () => document.documentElement.dataset.page || 'home'
export const pageRowKey = () => `page:${pageName()}`
export const isGlobalScope = (scope) => scope.startsWith('g-')

export function hash(str = '') {
  let h = 5381
  const s = String(str).replace(/\s+/g, ' ').trim()
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
export const normalise = (html = '') => String(html).replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').trim()

/** For elements that also contain an icon, edit only the text part (wrapped in a span). */
function textTarget(el) {
  if (!el.querySelector(':scope > svg')) return el
  let wrap = el.querySelector(':scope > [data-cms-wrap]')
  if (!wrap) {
    wrap = document.createElement('span')
    wrap.dataset.cmsWrap = ''
    const nodes = [...el.childNodes].filter((n) => !(n.nodeType === 1 && n.tagName.toLowerCase() === 'svg'))
    nodes.forEach((n) => wrap.appendChild(n))
    el.appendChild(wrap)
    wrap.innerHTML = wrap.innerHTML.trim()
  }
  return wrap
}

let registry = null

/** Find and key every editable thing on the page. Runs once, before overrides apply. */
export function indexPage() {
  if (registry) return registry
  registry = { text: [], images: [], videos: [], sections: [] }
  document.querySelectorAll('[data-s]').forEach((scopeEl) => {
    const scope = scopeEl.dataset.s
    registry.sections.push({ key: `${scope}:hidden`, scope, el: scopeEl })
    const own = (el) => el.closest('[data-s]') === scopeEl && !el.closest(EXCLUDE)
    const matches = [...scopeEl.querySelectorAll(TEXT_SEL)].filter(own)
    const outer = matches.filter((el) => !matches.some((other) => other !== el && other.contains(el)))
    outer.forEach((el, i) => {
      const target = textTarget(el)
      const key = `${scope}:t${i}`
      target.dataset.cmsKey = key
      const link = target.closest('a')
      registry.text.push({ key, scope, el: target, link, orig: target.innerHTML, origHref: link?.getAttribute('href') || null, origNewTab: link?.target === '_blank' })
    })
    ;[...scopeEl.querySelectorAll('img')].filter((el) => el.closest('[data-s]') === scopeEl && !el.closest('[data-noedit],[data-nav]')).forEach((el, i) => {
      const key = `${scope}:i${i}`
      el.dataset.cmsKey = key
      registry.images.push({ key, scope, el, orig: el.getAttribute('src'), origSrcset: el.getAttribute('srcset'), origAlt: el.getAttribute('alt') || '' })
    })
    ;[...scopeEl.querySelectorAll('video')].filter((el) => el.closest('[data-s]') === scopeEl).forEach((el, i) => {
      const key = `${scope}:v${i}`
      el.dataset.cmsKey = key
      const src = el.querySelector('source')?.getAttribute('src') || el.getAttribute('src')
      registry.videos.push({ key, scope, el, orig: src, origPoster: el.getAttribute('poster') || '' })
    })
  })
  return registry
}

/* ----------------------------- data loading ----------------------------- */

const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} } }
const writeCache = (c) => { if (window.acadiaConsent && !window.acadiaConsent.allowed('functional')) return; try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)) } catch { /* private mode */ } }

export async function restSelect(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: { apikey: SUPABASE_KEY, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json()
}

export async function fetchRows(keys) {
  const list = keys.map((k) => `"${k}"`).join(',')
  const rows = await restSelect('site_content', `select=key,data,updated_at&key=in.(${encodeURIComponent(list)})`)
  const out = {}
  rows.forEach((r) => { out[r.key] = r.data || {} })
  return out
}

export const state = { global: {}, page: {} }

export function settings() { return { ...DEFAULT_SETTINGS, ...(state.global.settings || {}) } }

/* ------------------------------- applying ------------------------------- */

function applyBlocks(blocks = {}) {
  const reg = indexPage()
  for (const item of reg.text) {
    const o = blocks[item.key]
    if (!o || o.o !== hash(item.orig)) continue
    if (typeof o.h === 'string') item.el.innerHTML = sanitize(o.h)
    if (item.link && o.href !== undefined) {
      const href = safeUrl(o.href)
      if (href) item.link.setAttribute('href', href)
      if (o.newTab) { item.link.target = '_blank'; item.link.rel = 'noopener' } else if (o.newTab === false) item.link.removeAttribute('target')
    }
  }
  for (const item of reg.images) {
    const o = blocks[item.key]
    if (!o || o.o !== hash(item.orig) || !safeUrl(o.src)) continue
    item.el.src = o.src
    item.el.closest('.fit-frame')?.style.setProperty('--bg', `url('${o.src}')`)
    item.el.removeAttribute('srcset')
    if (o.alt !== undefined) item.el.alt = o.alt
  }
  for (const item of reg.videos) {
    const o = blocks[item.key]
    if (!o || o.o !== hash(item.orig) || !safeUrl(o.src)) continue
    const source = item.el.querySelector('source')
    if (source) { source.src = o.src; source.type = o.type || 'video/mp4' } else item.el.src = o.src
    if (o.poster !== undefined) item.el.poster = safeUrl(o.poster)
    item.el.load()
    if (item.el.autoplay) item.el.play?.().catch(() => {})
  }
  for (const s of reg.sections) {
    if (blocks[s.key]?.hidden) s.el.setAttribute('data-cms-hidden', '')
  }
}

export function applySettings() {
  const s = settings()
  const tel = '+' + (s.phone || '').replace(/[^\d]/g, '').replace(/^0/, '44')
  document.querySelectorAll('[data-set]').forEach((el) => {
    const v = s[el.dataset.set]
    if (v) el.textContent = v
  })
  document.querySelectorAll('[data-link]').forEach((el) => {
    const kind = el.dataset.link
    let href = ''
    if (kind === 'tel') href = s.phone ? `tel:${tel}` : ''
    else if (kind === 'mailto') href = s.email ? `mailto:${s.email}` : ''
    else if (kind === 'wa') {
      const n = (s.whatsapp || '').replace(/[^\d]/g, '')
      href = n ? `https://wa.me/${n}${el.dataset.waText ? `?text=${encodeURIComponent(el.dataset.waText)}` : ''}` : ''
    } else href = safeUrl(s[kind] || '')
    if (href) { el.setAttribute('href', href); el.hidden = false } else if (['facebook', 'instagram', 'linkedin'].includes(kind)) el.hidden = true
  })
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear() })
}

function isActive(href) {
  try {
    const u = new URL(href, location.origin)
    if (u.origin !== location.origin) return false
    const norm = (p) => p.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/'
    return norm(u.pathname) === norm(location.pathname) && (!u.search || u.search === location.search)
  } catch { return false }
}

export function renderNav() {
  const nav = Array.isArray(state.global.nav) && state.global.nav.length ? state.global.nav : DEFAULT_NAV
  const cta = { ...DEFAULT_CTA, ...(state.global.cta || {}) }
  const s = settings()
  const link = (item, mobile) => {
    const href = safeUrl(item.href) || '/'
    const ext = item.newTab ? ' target="_blank" rel="noopener"' : ''
    const cls = [item.highlight ? 'reviews-link' : '', isActive(href) ? 'active' : ''].filter(Boolean).join(' ')
    const star = item.highlight && !mobile ? '<svg class="ic ic-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.5 2.3a.6.6 0 0 1 1 0l2.7 5.5 6 .9a.6.6 0 0 1 .3 1l-4.4 4.3 1 6a.6.6 0 0 1-.8.6L12 17.8l-5.4 2.8a.6.6 0 0 1-.8-.6l1-6L2.4 9.7a.6.6 0 0 1 .3-1l6-.9z"/></svg> ' : ''
    const a = `<a href="${escapeHtml(href)}"${ext}${cls ? ` class="${cls}"` : ''}${isActive(href) ? ' aria-current="page"' : ''}>${star}${escapeHtml(item.label)}</a>`
    return mobile ? a : `<li>${a}</li>`
  }
  const desk = document.getElementById('navLinks')
  const mob = document.getElementById('mobLinks')
  if (desk) desk.innerHTML = nav.map((i) => link(i, false)).join('')
  if (mob) mob.innerHTML = nav.map((i) => link(i, true)).join('')
  document.querySelectorAll('[data-nav-cta]').forEach((el) => {
    el.hidden = cta.show === false
    el.setAttribute('href', safeUrl(cta.href) || '/careers#apply')
    const span = el.querySelector('span')
    if (span) span.textContent = cta.label || 'Apply Now'
  })
  void s
}

export function applyAll() {
  applyBlocks({ ...(state.global.blocks || {}), ...(state.page.blocks || {}) })
  applySettings()
  renderNav()
  document.documentElement.classList.remove('cms-pending')
  document.dispatchEvent(new CustomEvent('cms:applied'))
}

/** Boot: apply cached content instantly, then refresh from Supabase. */
export async function initCms() {
  indexPage()
  const cache = readCache()
  const key = pageRowKey()
  if (cache.global || cache[key]) {
    state.global = cache.global || {}
    state.page = cache[key] || {}
  }
  applyAll()
  if (!CMS_ENABLED) return
  try {
    const rows = await fetchRows(['global', key])
    const changed = JSON.stringify(rows.global || {}) !== JSON.stringify(cache.global || {}) || JSON.stringify(rows[key] || {}) !== JSON.stringify(cache[key] || {})
    cache.global = rows.global || {}
    cache[key] = rows[key] || {}
    writeCache(cache)
    if (changed) {
      // Content changed since the cached copy: reset to the HTML defaults, then re-apply.
      resetToDefaults()
      state.global = cache.global
      state.page = cache[key]
      applyAll()
    }
  } catch (err) {
    console.warn('[cms] could not load live content', err)
  } finally {
    document.documentElement.classList.remove('cms-pending')
  }
}

export function resetToDefaults() {
  const reg = indexPage()
  reg.text.forEach((i) => { i.el.innerHTML = i.orig; if (i.link && i.origHref) i.link.setAttribute('href', i.origHref) })
  reg.images.forEach((i) => { i.el.src = i.orig; if (i.origSrcset) i.el.setAttribute('srcset', i.origSrcset); i.el.alt = i.origAlt })
  reg.sections.forEach((s) => s.el.removeAttribute('data-cms-hidden'))
}

export function updateCache(rowKey, data) {
  const cache = readCache()
  cache[rowKey] = data
  writeCache(cache)
}
