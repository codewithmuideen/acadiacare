/**
 * Cookie consent (UK GDPR + PECR, ICO guidance).
 *
 * - Strictly necessary storage is always on (consent record, admin sign-in).
 * - Everything else is OFF until the visitor chooses. Third-party embeds that can
 *   set cookies (Google Maps, CQC widget) are held back behind placeholders.
 * - "Accept all" and "Reject all" have equal prominence. Choice can be changed at
 *   any time ("Cookie settings" in the footer) and is re-asked after 6 months or
 *   when the policy version changes.
 * - Respects Global Privacy Control (optional categories default to off).
 *
 * Add a new category later (e.g. analytics) by adding it to CATEGORIES with
 * enabled:true, then gate the script with: consent.on('analytics', () => load())
 */
const CONSENT_COOKIE = 'acadia_consent'
const VERSION = 2
const MAX_AGE_DAYS = 180

export const CATEGORIES = [
  { id: 'necessary', title: 'Strictly necessary', locked: true, enabled: true,
    text: 'Essential for the website to work and to remember your cookie choice. These cannot be switched off.' },
  { id: 'functional', title: 'Functional and embedded content', enabled: true,
    text: 'Lets us show the interactive Google map and the live CQC rating widget, and remember page content so the site loads faster on your next visit. These third parties may set their own cookies.' },
  { id: 'analytics', title: 'Analytics', enabled: false,
    text: 'Helps us understand how visitors use the site so we can improve it.' },
]
const ACTIVE = CATEGORIES.filter((c) => c.enabled)

/* ------------------------------ storage ------------------------------ */
function readCookie() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  if (!m) return null
  try {
    const v = JSON.parse(decodeURIComponent(m[1]))
    if (v.v !== VERSION) return null
    if (Date.now() - (v.ts || 0) > MAX_AGE_DAYS * 864e5) return null
    return v
  } catch { return null }
}
function writeCookie(choices) {
  const value = { v: VERSION, ts: Date.now(), ...choices, necessary: true }
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`
  return value
}

/* ------------------------------ public API ------------------------------ */
const listeners = {}
let state = readCookie()

export const consent = {
  get: () => state,
  allowed: (cat) => cat === 'necessary' || !!(state && state[cat]),
  on(cat, fn) {
    ;(listeners[cat] ||= []).push(fn)
    if (consent.allowed(cat)) fn()
  },
  open: () => openPreferences(),
}
window.acadiaConsent = consent

function apply(choices, source) {
  const prev = state
  state = writeCookie(choices)
  document.documentElement.dataset.consent = ACTIVE.filter((c) => state[c.id]).map((c) => c.id).join(' ')
  for (const c of ACTIVE) {
    if (state[c.id] && !(prev && prev[c.id])) (listeners[c.id] || []).forEach((fn) => { try { fn() } catch (e) { console.warn(e) } })
  }
  // Withdrawing consent: remove what we stored and reload so third-party embeds unload.
  if (prev && ACTIVE.some((c) => prev[c.id] && !state[c.id])) {
    if (!state.functional) { try { localStorage.removeItem('acadia-cms-v1') } catch { /* ignore */ } }
    location.reload()
    return
  }
  document.dispatchEvent(new CustomEvent('consent:change', { detail: { ...state, source } }))
}

/* ------------------------------ UI ------------------------------ */
const COOKIE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01"/></svg>'
const X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'

let banner, modal, lastFocus

function buildBanner() {
  banner = document.createElement('div')
  banner.className = 'ck-banner'
  banner.setAttribute('role', 'region')
  banner.setAttribute('aria-label', 'Cookie consent')
  banner.innerHTML = `
    <div class="ck-head"><span class="ck-ic">${COOKIE_ICON}</span><h2 class="ck-title" id="ckTitle">We value your privacy</h2></div>
    <p class="ck-text">We use essential cookies to make this site work. With your permission we'd also like to load a few extras, like our interactive map and live CQC rating, which may set cookies. You can change your mind at any time. <a href="/privacy-policy#cookies">Read our cookie policy</a>.</p>
    <div class="ck-actions">
      <button type="button" class="ck-btn ck-primary" data-ck="accept">Accept all</button>
      <button type="button" class="ck-btn ck-primary" data-ck="reject">Reject all</button>
      <button type="button" class="ck-link" data-ck="manage">Manage preferences</button>
    </div>`
  banner.addEventListener('click', (e) => {
    const a = e.target.closest('[data-ck]')?.dataset.ck
    if (a === 'accept') { apply(Object.fromEntries(ACTIVE.map((c) => [c.id, true])), 'accept'); hideBanner() }
    if (a === 'reject') { apply(Object.fromEntries(ACTIVE.map((c) => [c.id, c.locked === true])), 'reject'); hideBanner() }
    if (a === 'manage') openPreferences()
  })
  document.body.appendChild(banner)
  requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')))
  document.documentElement.classList.add('ck-open')
}
function hideBanner() {
  if (!banner) return
  banner.classList.remove('show')
  document.documentElement.classList.remove('ck-open')
  const b = banner; banner = null
  setTimeout(() => b.remove(), 450)
}

function openPreferences() {
  if (modal) return
  lastFocus = document.activeElement
  const gpc = navigator.globalPrivacyControl === true
  const current = state || {}
  modal = document.createElement('div')
  modal.className = 'ck-modal-bg'
  modal.innerHTML = `
    <div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ckPrefTitle">
      <div class="ck-modal-h"><div class="ck-head"><span class="ck-ic">${COOKIE_ICON}</span><h2 class="ck-title" id="ckPrefTitle">Cookie preferences</h2></div>
        <button type="button" class="ck-x" data-ck="close" aria-label="Close">${X_ICON}</button></div>
      <div class="ck-modal-b">
        <p class="ck-text">Choose which cookies you're happy for us to use. Strictly necessary cookies are always on because the site can't work without them.${gpc ? ' <strong>Your browser has sent a Global Privacy Control signal, so optional cookies start switched off.</strong>' : ''}</p>
        ${ACTIVE.map((c) => {
          const on = c.locked || (current[c.id] ?? false)
          return `<div class="ck-cat">
            <div class="ck-cat-h"><label class="ck-cat-t" for="ck-${c.id}">${c.title}</label>
              ${c.locked ? '<span class="ck-always">Always on</span>' : `<span class="ck-switch"><input type="checkbox" id="ck-${c.id}" data-cat="${c.id}" ${on ? 'checked' : ''} role="switch" aria-describedby="ck-${c.id}-d"><span aria-hidden="true"></span></span>`}</div>
            <p class="ck-cat-d" id="ck-${c.id}-d">${c.text}</p></div>`
        }).join('')}
        <p class="ck-small">Full details of every cookie we use are in our <a href="/privacy-policy#cookies">cookie policy</a>.</p>
      </div>
      <div class="ck-modal-f">
        <button type="button" class="ck-btn ck-ghost" data-ck="reject">Reject all</button>
        <button type="button" class="ck-btn ck-ghost" data-ck="save">Save my choices</button>
        <button type="button" class="ck-btn ck-primary" data-ck="accept">Accept all</button>
      </div>
    </div>`
  const close = () => {
    modal.classList.remove('show')
    const m = modal; modal = null
    document.removeEventListener('keydown', onKey)
    setTimeout(() => m.remove(), 300)
    lastFocus?.focus?.()
  }
  const onKey = (e) => {
    if (e.key === 'Escape') close()
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [...modal.querySelectorAll('button, input, a[href]')].filter((x) => !x.disabled)
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) return close()
    const a = e.target.closest('[data-ck]')?.dataset.ck
    if (!a) return
    if (a === 'close') return close()
    let choices
    if (a === 'accept') choices = Object.fromEntries(ACTIVE.map((c) => [c.id, true]))
    if (a === 'reject') choices = Object.fromEntries(ACTIVE.map((c) => [c.id, !!c.locked]))
    if (a === 'save') choices = Object.fromEntries(ACTIVE.map((c) => [c.id, c.locked ? true : !!modal.querySelector(`[data-cat="${c.id}"]`)?.checked]))
    close(); hideBanner(); apply(choices, a)
  })
  document.addEventListener('keydown', onKey)
  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('show'))
  setTimeout(() => modal.querySelector('input, .ck-x')?.focus(), 50)
}

/* ------------------------------ gated embeds ------------------------------ */
function loadEmbed(el) {
  if (el.dataset.loaded) return
  el.dataset.loaded = '1'
  if (el.dataset.embedSrc) {
    const f = document.createElement('iframe')
    f.src = el.dataset.embedSrc
    f.title = el.dataset.embedTitle || 'Embedded content'
    f.loading = 'lazy'
    f.referrerPolicy = 'no-referrer-when-downgrade'
    f.setAttribute('allowfullscreen', '')
    el.replaceChildren(f)
  } else if (el.dataset.scriptSrc) {
    el.replaceChildren()
    const s = document.createElement('script')
    s.src = el.dataset.scriptSrc
    s.async = true
    el.appendChild(s)
  }
  el.classList.add('is-loaded')
}

function initEmbeds() {
  document.querySelectorAll('[data-consent]').forEach((el) => {
    const cat = el.dataset.consent
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-consent-allow]')
      if (!b) return
      if (b.dataset.consentAllow === 'once') loadEmbed(el)
      else apply({ ...(state || {}), [cat]: true }, 'embed')
    })
    consent.on(cat, () => loadEmbed(el))
  })
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); openPreferences() }
  })
}

export function initConsent() {
  if (state) document.documentElement.dataset.consent = ACTIVE.filter((c) => state[c.id]).map((c) => c.id).join(' ')
  initEmbeds()
  if (!state) setTimeout(buildBanner, 700) // let the page settle first
}
