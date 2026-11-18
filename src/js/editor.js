/**
 * Inline visual editor ("edit the live page, click Save").
 * Loaded only when a Supabase session exists, and only activates for admins.
 */
import '../css/editor.css'
import { getClient, isAdmin } from './supabase.js'
import { indexPage, state, hash, normalise, isGlobalScope, pageRowKey, pageName, applySettings, renderNav, updateCache } from './cms.js'
import { sanitize, safeUrl, escapeHtml } from './sanitize.js'
import { el, toast, modal, navEditor, settingsForm, pickMedia, loadRow, saveRow, I } from './admin-ui.js'

let sb, reg, editing = false, dirty = false
const html = document.documentElement
const BLOCK_TAGS = new Set(['P', 'BLOCKQUOTE', 'TD', 'LI'])

const ICONS = {
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.4 3.6a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7H7v7M7 3v4h7"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.9 4.2A9 9 0 0 1 12 4c6.5 0 10 8 10 8a13 13 0 0 1-1.7 2.7M6.6 6.6A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.7"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
}

export async function startEditor() {
  sb = await getClient()
  if (!(await isAdmin(sb))) return
  reg = indexPage()
  buildBar()
  if (sessionStorage.getItem('acadia-edit') === '1' || new URLSearchParams(location.search).has('edit')) setEditing(true)
  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = '' } })
}

/* ------------------------------ toolbar ------------------------------ */
let bar
function buildBar() {
  bar = el(`<div class="ae-ui ae-bar" role="toolbar" aria-label="Website editor">
    <span class="ae-brand">Acadia <b>Editor</b></span>
    <button class="ae-tb" data-a="edit">${ICONS.pen}<span>Edit page</span></button>
    <button class="ae-tb" data-a="menu">${ICONS.menu}<span>Menu</span></button>
    <button class="ae-tb" data-a="settings">${ICONS.gear}<span>Settings</span></button>
    <span class="ae-status" aria-live="polite"></span>
    <button class="ae-tb ae-save" data-a="save" disabled>${ICONS.save}<span>Save</span></button>
    <button class="ae-tb" data-a="discard" hidden><span>Discard</span></button>
    <a class="ae-tb" href="/admin" title="Dashboard">${ICONS.grid}<span>Dashboard</span></a>
    <button class="ae-tb" data-a="logout" title="Sign out">${ICONS.out}</button>
  </div>`)
  bar.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a
    if (a === 'edit') setEditing(!editing)
    if (a === 'menu') openMenu()
    if (a === 'settings') openSettings()
    if (a === 'save') save()
    if (a === 'discard') { dirty = false; sessionStorage.setItem('acadia-edit', editing ? '1' : '0'); location.reload() }
    if (a === 'logout') sb.auth.signOut().then(() => { sessionStorage.removeItem('acadia-edit'); location.reload() })
  })
  document.body.appendChild(bar)
  html.classList.add('ae-has-bar')
}

function setDirty(v = true) {
  dirty = v
  bar.querySelector('[data-a="save"]').disabled = !v
  bar.querySelector('[data-a="discard"]').hidden = !v
  bar.querySelector('.ae-status').textContent = v ? 'Unsaved changes' : ''
}

/* ------------------------------ edit mode ------------------------------ */
function setEditing(on) {
  editing = on
  sessionStorage.setItem('acadia-edit', on ? '1' : '0')
  html.classList.toggle('cms-editing', on)
  bar.querySelector('[data-a="edit"] span').textContent = on ? 'Done editing' : 'Edit page'
  bar.querySelector('[data-a="edit"]').classList.toggle('on', on)
  reg.text.forEach((it) => {
    if (on) { it.el.contentEditable = 'true'; it.el.spellcheck = true; it.el.classList.add('ae-editable') } else { it.el.removeAttribute('contenteditable'); it.el.classList.remove('ae-editable') }
  })
  customPageEditable(on)
  if (on) { document.addEventListener('click', blockLinks, true); renderHandles(); toast('Edit mode on: click any text to change it.') } else { document.removeEventListener('click', blockLinks, true); clearHandles(); hideFormatBar() }
}

function blockLinks(e) {
  if (e.target.closest('.ae-ui')) return
  const a = e.target.closest('a')
  if (a && !(e.ctrlKey || e.metaKey)) e.preventDefault()
}

document.addEventListener('input', (e) => { if (editing && e.target.closest('[contenteditable="true"]')) setDirty() })
document.addEventListener('paste', (e) => {
  const ed = e.target.closest?.('[contenteditable="true"]')
  if (!editing || !ed || ed.id === 'cpBody') return
  e.preventDefault()
  document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'))
})
document.addEventListener('keydown', (e) => {
  const ed = e.target.closest?.('[contenteditable="true"]')
  if (!editing || !ed || ed.id === 'cpBody' || e.key !== 'Enter') return
  e.preventDefault()
  if (BLOCK_TAGS.has(ed.tagName) || e.shiftKey) document.execCommand('insertLineBreak')
})

/* --------------------------- formatting bar --------------------------- */
let fbar, activeItem
function ensureFormatBar() {
  if (fbar) return fbar
  fbar = el(`<div class="ae-ui ae-fbar">
    <button data-c="bold" title="Bold"><b>B</b></button>
    <button data-c="italic" title="Italic"><i>I</i></button>
    <button data-c="createLink" title="Link selected text">${ICONS.link}</button>
    <button data-c="removeFormat" title="Clear formatting">T<sub>x</sub></button>
    <div class="ae-linkf" hidden>
      <input data-href placeholder="Button link e.g. /contact" list="ae-fb-pages">
      <label><input type="checkbox" data-newtab> New tab</label>
    </div>
    <span class="ae-fhint" hidden></span>
    <datalist id="ae-fb-pages"><option value="/"><option value="/about"><option value="/services"><option value="/careers"><option value="/careers#apply"><option value="/contact"></datalist>
  </div>`)
  fbar.addEventListener('mousedown', (e) => { if (!e.target.closest('input,label')) e.preventDefault() })
  fbar.addEventListener('click', (e) => {
    const c = e.target.closest('[data-c]')?.dataset.c
    if (!c) return
    if (c === 'createLink') {
      const url = prompt('Link address (e.g. /contact or https://...)')
      if (url && safeUrl(url)) document.execCommand('createLink', false, url)
    } else document.execCommand(c)
    setDirty()
  })
  fbar.querySelector('[data-href]').addEventListener('input', (e) => { if (activeItem?.link) { activeItem.link.setAttribute('href', e.target.value.trim()); setDirty() } })
  fbar.querySelector('[data-newtab]').addEventListener('change', (e) => {
    if (!activeItem?.link) return
    if (e.target.checked) { activeItem.link.target = '_blank'; activeItem.link.rel = 'noopener' } else activeItem.link.removeAttribute('target')
    setDirty()
  })
  document.body.appendChild(fbar)
  return fbar
}
function showFormatBar(item) {
  activeItem = item
  const f = ensureFormatBar()
  const lf = f.querySelector('.ae-linkf')
  const hint = f.querySelector('.ae-fhint')
  const managed = item.link?.hasAttribute('data-link')
  lf.hidden = !item.link || managed
  hint.hidden = !managed
  hint.textContent = managed ? 'Link set in Settings' : ''
  if (item.link && !managed) { lf.querySelector('[data-href]').value = item.link.getAttribute('href') || ''; lf.querySelector('[data-newtab]').checked = item.link.target === '_blank' }
  const r = item.el.getBoundingClientRect()
  f.style.display = 'flex'
  const top = r.top + window.scrollY - f.offsetHeight - 10
  f.style.top = `${top < window.scrollY + 8 ? r.bottom + window.scrollY + 10 : top}px`
  f.style.left = `${Math.max(8, Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - f.offsetWidth - 8))}px`
}
function hideFormatBar() { if (fbar) fbar.style.display = 'none'; activeItem = null }
document.addEventListener('focusin', (e) => {
  if (!editing) return
  const item = reg?.text.find((t) => t.el === e.target)
  if (item) showFormatBar(item)
  else if (!e.target.closest('.ae-fbar')) hideFormatBar()
})

/* ------------------- media + section handles (edit mode) ------------------- */
let handles = []
function clearHandles() { handles.forEach((h) => h.remove()); handles = []; window.removeEventListener('resize', renderHandles) }
function renderHandles() {
  clearHandles()
  window.addEventListener('resize', renderHandles)
  const place = (node, target, corner = 'tr') => {
    const r = target.getBoundingClientRect()
    if (!r.width || !r.height) return
    node.style.top = `${r.top + window.scrollY + 10}px`
    node.style.left = corner === 'tl' ? `${r.left + window.scrollX + 10}px` : `${r.right + window.scrollX - 10}px`
    if (corner === 'tr') node.style.transform = 'translateX(-100%)'
    document.body.appendChild(node)
    handles.push(node)
  }
  reg.images.forEach((it) => {
    const b = el(`<button class="ae-ui ae-handle">${I.image}<span>${it.el.classList.contains('ph-bg') ? 'Background' : 'Image'}</span></button>`)
    b.onclick = async () => {
      const r = await pickMedia(sb, { kind: 'image', src: it.el.getAttribute('src'), alt: it.el.alt })
      if (!r) return
      it.el.src = r.src; it.el.removeAttribute('srcset'); it.el.alt = r.alt
      setDirty()
    }
    place(b, it.el.classList.contains('ph-bg') ? it.el.parentElement : it.el)
  })
  reg.videos.forEach((it) => {
    const b = el(`<button class="ae-ui ae-handle">${I.video}<span>Video</span></button>`)
    b.onclick = async () => {
      const cur = it.el.querySelector('source')?.getAttribute('src') || it.el.getAttribute('src')
      const r = await pickMedia(sb, { kind: 'video', src: cur, poster: it.el.getAttribute('poster') || '' })
      if (!r) return
      const s = it.el.querySelector('source')
      if (s) s.src = r.src; else it.el.src = r.src
      if (r.poster) it.el.poster = r.poster
      it.el.load(); if (it.el.autoplay) it.el.play().catch(() => {})
      setDirty()
    }
    place(b, it.el.closest('.hero-media, .vid-thumb') || it.el)
  })
  reg.sections.filter((s) => !isGlobalScope(s.scope)).forEach((s) => {
    const hidden = s.el.hasAttribute('data-cms-hidden')
    const b = el(`<button class="ae-ui ae-handle ae-sec ${hidden ? 'is-hidden' : ''}" title="Show or hide this whole section">${hidden ? ICONS.eyeOff : ICONS.eye}<span>${hidden ? 'Hidden section (click to show)' : 'Hide section'}</span></button>`)
    b.onclick = () => { s.el.toggleAttribute('data-cms-hidden'); setDirty(); renderHandles() }
    place(b, s.el, 'tl')
  })
}

/* ------------------------------ menu + settings ------------------------------ */
async function customPages() {
  const { data } = await sb.from('pages').select('slug,title').eq('published', true).order('title')
  return data || []
}
async function openMenu() {
  const ed = navEditor(state.global.nav, state.global.cta, await customPages().catch(() => []))
  modal({ title: 'Edit menu', body: ed.el, wide: true, actions: [
    { label: 'Cancel' },
    { label: 'Apply', primary: true, onClick: () => { Object.assign(state.global, ed.value()); renderNav(); setDirty(); toast('Menu updated. Click Save to publish.') } },
  ] })
}
function openSettings() {
  const f = settingsForm(state.global.settings)
  modal({ title: 'Site settings', body: f.el, wide: true, actions: [
    { label: 'Cancel' },
    { label: 'Apply', primary: true, onClick: () => { state.global.settings = f.value(); applySettings(); setDirty(); toast('Settings updated. Click Save to publish.') } },
  ] })
}

/* ------------------------------ custom pages ------------------------------ */
let cpBar
function customPageEditable(on) {
  const slug = html.dataset.customSlug
  if (pageName() !== 'custom' || !slug) return
  ;['cpTitle', 'cpIntro', 'cpBody'].forEach((id) => {
    const n = document.getElementById(id)
    if (on) { n.contentEditable = 'true'; n.classList.add('ae-editable') } else { n.removeAttribute('contenteditable'); n.classList.remove('ae-editable') }
  })
  if (on && !cpBar) {
    cpBar = el(`<div class="ae-ui ae-cpbar">
      <button data-b="formatBlock:h2">H2</button><button data-b="formatBlock:h3">H3</button><button data-b="formatBlock:p">P</button>
      <button data-b="bold"><b>B</b></button><button data-b="italic"><i>I</i></button>
      <button data-b="insertUnorderedList">• List</button><button data-b="insertOrderedList">1. List</button>
      <button data-b="link">${ICONS.link} Link</button><button data-b="image">${I.image} Image</button><button data-b="video">${I.video} Video</button>
    </div>`)
    cpBar.addEventListener('mousedown', (e) => e.preventDefault())
    cpBar.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-b]')?.dataset.b
      if (!b) return
      document.getElementById('cpBody').focus()
      if (b.startsWith('formatBlock:')) document.execCommand('formatBlock', false, b.split(':')[1])
      else if (b === 'link') { const u = prompt('Link address'); if (u && safeUrl(u)) document.execCommand('createLink', false, u) }
      else if (b === 'image' || b === 'video') {
        const sel = window.getSelection(); const range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null
        const r = await pickMedia(sb, { kind: b })
        if (!r) return
        if (range) { sel.removeAllRanges(); sel.addRange(range) }
        document.execCommand('insertHTML', false, b === 'image' ? `<img src="${escapeHtml(r.src)}" alt="${escapeHtml(r.alt)}">` : `<video src="${escapeHtml(r.src)}" ${r.poster ? `poster="${escapeHtml(r.poster)}"` : ''} controls playsinline></video>`)
      } else document.execCommand(b)
      setDirty()
    })
    document.querySelector('.ph').after(cpBar)
  }
  if (cpBar) cpBar.hidden = !on
}

/* ------------------------------ save ------------------------------ */
function collectBlocks() {
  const out = { global: {}, page: {} }
  const put = (scope, key, val) => { (isGlobalScope(scope) ? out.global : out.page)[key] = val }
  reg.text.forEach((it) => {
    const cur = it.el.innerHTML
    const textChanged = normalise(cur) !== normalise(it.orig)
    const curHref = it.link?.getAttribute('href') ?? null
    const newTab = it.link ? it.link.target === '_blank' : undefined
    const linkChanged = !!it.link && !it.link.hasAttribute('data-link') && (curHref !== it.origHref || newTab !== it.origNewTab)
    if (!textChanged && !linkChanged) return
    const o = { o: hash(it.orig) }
    if (textChanged) o.h = sanitize(cur)
    if (linkChanged) { o.href = curHref; o.newTab = newTab }
    put(it.scope, it.key, o)
  })
  reg.images.forEach((it) => {
    const src = it.el.getAttribute('src')
    if (src === it.orig && (it.el.alt || '') === it.origAlt) return
    put(it.scope, it.key, { o: hash(it.orig), src, alt: it.el.alt || '' })
  })
  reg.videos.forEach((it) => {
    const src = it.el.querySelector('source')?.getAttribute('src') || it.el.getAttribute('src')
    const poster = it.el.getAttribute('poster') || ''
    if (src === it.orig && poster === it.origPoster) return
    put(it.scope, it.key, { o: hash(it.orig), src, poster })
  })
  reg.sections.forEach((s) => { if (s.el.hasAttribute('data-cms-hidden')) put(s.scope, s.key, { hidden: true }) })
  return out
}

async function save() {
  const btn = bar.querySelector('[data-a="save"]')
  btn.disabled = true
  bar.querySelector('.ae-status').textContent = 'Saving…'
  try {
    const blocks = collectBlocks()
    const latestGlobal = await loadRow(sb, 'global')
    const globalData = { ...latestGlobal, settings: state.global.settings ?? latestGlobal.settings, nav: state.global.nav ?? latestGlobal.nav, cta: state.global.cta ?? latestGlobal.cta, blocks: blocks.global }
    Object.keys(globalData).forEach((k) => globalData[k] === undefined && delete globalData[k])
    await saveRow(sb, 'global', globalData)
    state.global = globalData
    updateCache('global', globalData)
    if (reg.sections.some((s) => !isGlobalScope(s.scope))) {
      const pageData = { blocks: blocks.page }
      await saveRow(sb, pageRowKey(), pageData)
      state.page = pageData
      updateCache(pageRowKey(), pageData)
    }
    if (pageName() === 'custom' && html.dataset.customSlug) {
      const { error } = await sb.from('pages').update({
        title: document.getElementById('cpTitle').textContent.trim(),
        intro: document.getElementById('cpIntro').textContent.trim(),
        body: sanitize(document.getElementById('cpBody').innerHTML, 'block'),
        updated_at: new Date().toISOString(),
      }).eq('slug', html.dataset.customSlug)
      if (error) throw error
    }
    setDirty(false)
    toast('Saved. Your changes are now live for everyone.')
  } catch (err) {
    console.error(err)
    bar.querySelector('.ae-status').textContent = 'Save failed'
    btn.disabled = false
    toast(`Could not save: ${err.message || err}`, 'err')
  }
}
