/** UI building blocks shared by the inline editor and the admin dashboard. */
import { escapeHtml, safeUrl } from './sanitize.js'
import { DEFAULT_SETTINGS, DEFAULT_NAV, DEFAULT_CTA, SITE_PAGES, MEDIA_BUCKET } from './config.js'
import { safeFileName, uuid } from './supabase.js'

export const I = {
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m18 15-6-6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
}

export function el(html) {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}

/* ---------------- toast ---------------- */
export function toast(msg, type = 'ok') {
  let host = document.querySelector('.ae-toasts')
  if (!host) { host = el('<div class="ae-ui ae-toasts" role="status" aria-live="polite"></div>'); document.body.appendChild(host) }
  const t = el(`<div class="ae-toast ae-toast-${type}">${escapeHtml(msg)}</div>`)
  host.appendChild(t)
  setTimeout(() => t.classList.add('out'), 3600)
  setTimeout(() => t.remove(), 4200)
}

/* ---------------- modal ---------------- */
export function modal({ title, body, actions = [], wide = false }) {
  const m = el(`<div class="ae-ui ae-modal-bg"><div class="ae-modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
    <div class="ae-modal-h"><h3>${escapeHtml(title)}</h3><button class="ae-icon-btn" data-close aria-label="Close">${I.x}</button></div>
    <div class="ae-modal-b"></div><div class="ae-modal-f"></div></div></div>`)
  const b = m.querySelector('.ae-modal-b')
  if (typeof body === 'string') b.innerHTML = body; else if (body) b.appendChild(body)
  const f = m.querySelector('.ae-modal-f')
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey) }
  const onKey = (e) => { if (e.key === 'Escape') close() }
  actions.forEach((a) => {
    const btn = el(`<button class="ae-btn ${a.primary ? 'ae-btn-primary' : ''} ${a.danger ? 'ae-btn-danger' : ''}">${escapeHtml(a.label)}</button>`)
    btn.addEventListener('click', async () => {
      btn.disabled = true
      try { const r = await a.onClick?.(close); if (r !== false && a.closes !== false) close() } finally { btn.disabled = false }
    })
    f.appendChild(btn)
  })
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) close() })
  document.addEventListener('keydown', onKey)
  document.body.appendChild(m)
  setTimeout(() => m.querySelector('input,select,textarea,button')?.focus(), 30)
  return { el: m, body: b, close }
}

export const confirmBox = (title, text, label = 'Confirm', danger = true) => new Promise((resolve) => {
  modal({ title, body: `<p class="ae-muted">${escapeHtml(text)}</p>`, actions: [
    { label: 'Cancel', onClick: () => resolve(false) },
    { label, primary: !danger, danger, onClick: () => resolve(true) },
  ] })
})

/* ---------------- menu (navigation) editor ---------------- */
export function navEditor(nav, cta, customPages = []) {
  const items = (Array.isArray(nav) && nav.length ? nav : DEFAULT_NAV).map((i) => ({ ...i }))
  const c = { ...DEFAULT_CTA, ...(cta || {}) }
  const targets = [...SITE_PAGES, ...customPages.map((p) => ({ label: `Page: ${p.title}`, href: `/p/${p.slug}` }))]
  const wrap = el(`<div class="ae-nav-ed">
    <p class="ae-muted">Add, rename, reorder or remove menu links. Changes apply to the top menu and the mobile menu.</p>
    <div class="ae-nav-list"></div>
    <div class="ae-row-actions"><button class="ae-btn" data-add>${I.plus} Add menu link</button></div>
    <datalist id="ae-targets">${targets.map((t) => `<option value="${escapeHtml(t.href)}">${escapeHtml(t.label)}</option>`).join('')}</datalist>
    <h4 class="ae-sub">Header button</h4>
    <div class="ae-grid3">
      <label class="ae-field"><span>Button text</span><input data-cta="label" value="${escapeHtml(c.label)}"></label>
      <label class="ae-field"><span>Button link</span><input data-cta="href" list="ae-targets" value="${escapeHtml(c.href)}"></label>
      <label class="ae-check"><input type="checkbox" data-cta="show" ${c.show !== false ? 'checked' : ''}> Show button</label>
    </div></div>`)
  const list = wrap.querySelector('.ae-nav-list')
  const render = () => {
    list.innerHTML = ''
    items.forEach((it, i) => {
      const row = el(`<div class="ae-nav-row">
        <label class="ae-field"><span>Label</span><input data-k="label" value="${escapeHtml(it.label || '')}"></label>
        <label class="ae-field"><span>Link (page or URL)</span><input data-k="href" list="ae-targets" value="${escapeHtml(it.href || '')}" placeholder="/about or https://..."></label>
        <div class="ae-nav-opts">
          <label class="ae-check"><input type="checkbox" data-k="newTab" ${it.newTab ? 'checked' : ''}> New tab</label>
          <label class="ae-check"><input type="checkbox" data-k="highlight" ${it.highlight ? 'checked' : ''}> Highlight</label>
        </div>
        <div class="ae-nav-btns">
          <button class="ae-icon-btn" data-up title="Move up" ${i === 0 ? 'disabled' : ''}>${I.up}</button>
          <button class="ae-icon-btn" data-down title="Move down" ${i === items.length - 1 ? 'disabled' : ''}>${I.down}</button>
          <button class="ae-icon-btn danger" data-del title="Remove">${I.trash}</button>
        </div></div>`)
      row.addEventListener('input', (e) => {
        const k = e.target.dataset.k
        if (!k) return
        it[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      })
      row.querySelector('[data-up]').onclick = () => { items.splice(i - 1, 0, items.splice(i, 1)[0]); render() }
      row.querySelector('[data-down]').onclick = () => { items.splice(i + 1, 0, items.splice(i, 1)[0]); render() }
      row.querySelector('[data-del]').onclick = () => { items.splice(i, 1); render() }
      list.appendChild(row)
    })
  }
  wrap.querySelector('[data-add]').onclick = () => { items.push({ label: 'New link', href: '/' }); render(); list.lastElementChild?.querySelector('input')?.select() }
  render()
  return {
    el: wrap,
    value() {
      const cleanNav = items.filter((i) => i.label?.trim() && safeUrl(i.href)).map((i) => ({ label: i.label.trim(), href: i.href.trim(), newTab: !!i.newTab, highlight: !!i.highlight }))
      const get = (k) => wrap.querySelector(`[data-cta="${k}"]`)
      return { nav: cleanNav, cta: { label: get('label').value.trim() || 'Apply Now', href: safeUrl(get('href').value.trim()) || '/careers#apply', show: get('show').checked } }
    },
  }
}

/* ---------------- site settings ---------------- */
const SETTING_FIELDS = [
  ['phone', 'Phone number (shown on the site)', '07949 720 932'],
  ['whatsapp', 'WhatsApp number (international, digits only)', '447949720932'],
  ['email', 'Public email address', 'care@acadiacare.co.uk'],
  ['address', 'Address', ''],
  ['reviewScore', 'homecare.co.uk review score', '8.5'],
  ['reviews', 'homecare.co.uk profile URL', 'https://'],
  ['facebook', 'Facebook URL', 'https://'],
  ['instagram', 'Instagram URL', 'https://'],
  ['linkedin', 'LinkedIn URL (leave empty to hide)', 'https://'],
]
export function settingsForm(current) {
  const s = { ...DEFAULT_SETTINGS, ...(current || {}) }
  const wrap = el(`<div class="ae-settings"><p class="ae-muted">These details appear everywhere on the site (header, footer, contact page, WhatsApp buttons).</p><div class="ae-grid2">
    ${SETTING_FIELDS.map(([k, label, ph]) => `<label class="ae-field"><span>${label}</span><input data-s="${k}" value="${escapeHtml(s[k] || '')}" placeholder="${escapeHtml(ph)}"></label>`).join('')}
  </div></div>`)
  return {
    el: wrap,
    value() {
      const out = {}
      wrap.querySelectorAll('[data-s]').forEach((i) => { out[i.dataset.s] = i.value.trim() })
      out.whatsapp = out.whatsapp.replace(/[^\d]/g, '')
      return out
    },
  }
}

/* ---------------- media library / uploader ---------------- */
export async function uploadMedia(sb, file) {
  const d = new Date()
  const path = `uploads/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${uuid().slice(0, 8)}-${safeFileName(file.name)}`
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) throw error
  return sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function listMedia(sb, kind) {
  const out = []
  const walk = async (prefix, depth) => {
    const { data, error } = await sb.storage.from(MEDIA_BUCKET).list(prefix, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
    if (error || !data) return
    for (const f of data) {
      const p = prefix ? `${prefix}/${f.name}` : f.name
      if (!f.id && depth < 3) await walk(p, depth + 1)
      else if (f.id) out.push({ path: p, name: f.name, type: f.metadata?.mimetype || '', url: sb.storage.from(MEDIA_BUCKET).getPublicUrl(p).data.publicUrl, created: f.created_at })
    }
  }
  await walk('uploads', 0)
  return out.filter((f) => !kind || f.type.startsWith(kind)).sort((a, b) => String(b.created).localeCompare(String(a.created)))
}

/** Opens a picker. Resolves with { src, alt, poster } or null. */
export function pickMedia(sb, { kind = 'image', src = '', alt = '', poster = '', title } = {}) {
  return new Promise((resolve) => {
    const isVideo = kind === 'video'
    const body = el(`<div class="ae-media">
      <div class="ae-media-preview">${isVideo ? `<video src="${escapeHtml(src)}" poster="${escapeHtml(poster)}" muted playsinline controls></video>` : `<img src="${escapeHtml(src)}" alt="">`}</div>
      <label class="ae-drop">${I.upload}<strong>Upload a new ${kind}</strong><span>${isVideo ? 'MP4 or WebM, up to 50MB' : 'JPG, PNG or WebP, up to 10MB'}</span><input type="file" accept="${isVideo ? 'video/mp4,video/webm' : 'image/*'}"></label>
      <div class="ae-upload-status ae-muted"></div>
      <label class="ae-field"><span>…or paste a URL</span><input data-src value="${escapeHtml(src)}" placeholder="https://"></label>
      ${isVideo ? `<label class="ae-field"><span>Poster image URL (shown before the video plays)</span><input data-poster value="${escapeHtml(poster)}" placeholder="https://"></label>` : `<label class="ae-field"><span>Alt text (describe the image for screen readers and Google)</span><input data-alt value="${escapeHtml(alt)}"></label>`}
      <h4 class="ae-sub">Media library</h4><div class="ae-lib"><p class="ae-muted">Loading…</p></div>
    </div>`)
    const prev = body.querySelector('.ae-media-preview')
    const srcIn = body.querySelector('[data-src]')
    const setSrc = (u) => {
      srcIn.value = u
      const m = prev.querySelector(isVideo ? 'video' : 'img')
      m.src = u
    }
    srcIn.addEventListener('change', () => setSrc(srcIn.value.trim()))
    const status = body.querySelector('.ae-upload-status')
    body.querySelector('input[type=file]').addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const limit = (isVideo ? 50 : 10) * 1024 * 1024
      if (file.size > limit) { status.textContent = `That file is too large (max ${isVideo ? 50 : 10}MB).`; return }
      status.textContent = `Uploading ${file.name}…`
      try { setSrc(await uploadMedia(sb, file)); status.textContent = 'Uploaded. Click "Use this" to apply.' } catch (err) { status.textContent = `Upload failed: ${err.message}` }
    })
    listMedia(sb, kind).then((files) => {
      const lib = body.querySelector('.ae-lib')
      if (!files.length) { lib.innerHTML = '<p class="ae-muted">No uploads yet.</p>'; return }
      lib.innerHTML = ''
      files.slice(0, 60).forEach((f) => {
        const b = el(`<button type="button" class="ae-lib-item" title="${escapeHtml(f.name)}">${isVideo ? `<video src="${escapeHtml(f.url)}#t=0.5" muted preload="metadata"></video>` : `<img src="${escapeHtml(f.url)}" alt="" loading="lazy">`}</button>`)
        b.onclick = () => setSrc(f.url)
        lib.appendChild(b)
      })
    }).catch(() => { body.querySelector('.ae-lib').innerHTML = '<p class="ae-muted">Could not load the library.</p>' })
    modal({ title: title || (isVideo ? 'Change video' : 'Change image'), body, wide: true, actions: [
      { label: 'Cancel', onClick: () => resolve(null) },
      { label: 'Use this', primary: true, onClick: () => {
        const s = safeUrl(srcIn.value.trim())
        if (!s) { status.textContent = 'Please upload a file or enter a valid URL.'; return false }
        resolve({ src: s, alt: body.querySelector('[data-alt]')?.value.trim() ?? alt, poster: safeUrl(body.querySelector('[data-poster]')?.value.trim() || '') })
      } },
    ] })
  })
}

/* ---------------- data helpers ---------------- */
export async function loadRow(sb, key) {
  const { data, error } = await sb.from('site_content').select('data').eq('key', key).maybeSingle()
  if (error) throw error
  return data?.data || {}
}
export async function saveRow(sb, key, data) {
  const { error } = await sb.from('site_content').upsert({ key, data, updated_at: new Date().toISOString() })
  if (error) throw error
}
