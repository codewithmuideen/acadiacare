import { getClient, isAdmin } from './supabase.js'
import { CMS_ENABLED, APPLICATION_BUCKET, SITE_PAGES } from './config.js'
import { escapeHtml, sanitize } from './sanitize.js'
import { el, toast, modal, confirmBox, navEditor, settingsForm, loadRow, saveRow, listMedia, uploadMedia, I } from './admin-ui.js'

const $ = (s, r = document) => r.querySelector(s)
const show = (id) => ['authView', 'appView', 'loadingView'].forEach((v) => { $('#' + v).hidden = v !== id })
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const STATUSES = { applications: ['new', 'reviewing', 'interview', 'offered', 'hired', 'rejected'], enquiries: ['new', 'in progress', 'resolved'] }

let sb
let user

async function boot() {
  if (!CMS_ENABLED) {
    show('authView')
    $('#authSub').textContent = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild.'
    $('#loginForm').hidden = true
    return
  }
  sb = await getClient()
  sb.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') showReset() })
  if (location.hash.includes('type=recovery') || location.hash.includes('type=invite')) { show('authView'); showReset(); return }
  await route()
}

async function route() {
  const { data: { session } } = await sb.auth.getSession()
  if (!session) { show('authView'); return }
  user = session.user
  if (!(await isAdmin(sb))) {
    show('authView')
    msg('#loginForm', `${escapeHtml(user.email)} is signed in but is not an admin. Ask an existing admin to add this email in Supabase (table "admins").`)
    return
  }
  show('appView')
  $('#whoami').textContent = user.email
  refreshCounts()
  openTab(location.hash.replace('#', '') || 'overview')
}

function msg(formSel, text, ok = false) {
  const m = $(`${formSel} .ad-msg`)
  m.innerHTML = text
  m.className = `ad-msg ${ok ? 'ok' : 'err'}`
}

/* ---------------- auth ---------------- */
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const fd = new FormData(e.target)
  const btn = e.target.querySelector('[type=submit]')
  btn.disabled = true
  const { error } = await sb.auth.signInWithPassword({ email: fd.get('email').trim(), password: fd.get('password') })
  btn.disabled = false
  if (error) return msg('#loginForm', escapeHtml(error.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : error.message))
  route()
})
$('#forgotBtn').addEventListener('click', async () => {
  const email = $('#loginForm [name=email]').value.trim()
  if (!email) return msg('#loginForm', 'Enter your email above first, then click "Forgot password?".')
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin` })
  msg('#loginForm', error ? escapeHtml(error.message) : 'If that email has an account, a reset link is on its way. Check your inbox.', !error)
})
function showReset() {
  $('#authTitle').textContent = 'Set a new password'
  $('#authSub').textContent = 'Choose a strong password you have not used elsewhere.'
  $('#loginForm').hidden = true
  $('#resetForm').hidden = false
}
$('#resetForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const fd = new FormData(e.target)
  if (fd.get('password') !== fd.get('confirm')) return msg('#resetForm', 'The passwords do not match.')
  const { error } = await sb.auth.updateUser({ password: fd.get('password') })
  if (error) return msg('#resetForm', escapeHtml(error.message))
  history.replaceState(null, '', '/admin')
  toast('Password updated.')
  $('#resetForm').hidden = true; $('#loginForm').hidden = false
  route()
})
$('#logoutBtn').addEventListener('click', async () => { await sb.auth.signOut(); sessionStorage.removeItem('acadia-edit'); location.reload() })

/* ---------------- tabs ---------------- */
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) openTab(b.dataset.tab) })
const TABS = { overview, pages, applications: () => inbox('applications'), enquiries: () => inbox('enquiries'), menu, settings, custom, media, account }
function openTab(name) {
  if (!TABS[name]) name = 'overview'
  document.querySelectorAll('#tabs [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === name))
  history.replaceState(null, '', `#${name}`)
  const panel = $('#panel')
  panel.innerHTML = '<div class="ad-spin"></div>'
  Promise.resolve(TABS[name](panel)).catch((err) => { console.error(err); panel.innerHTML = `<div class="ad-card"><h2>Something went wrong</h2><p class="ae-muted">${escapeHtml(err.message || String(err))}</p><p class="ae-muted">If this mentions a missing table, run <code>supabase/schema.sql</code> in the Supabase SQL editor.</p></div>` })
  panel.focus({ preventScroll: true })
}

async function refreshCounts() {
  for (const t of ['applications', 'enquiries']) {
    const { count } = await sb.from(t).select('id', { count: 'exact', head: true }).eq('status', 'new')
    const b = document.querySelector(`[data-count="${t}"]`)
    if (b) b.textContent = count ? String(count) : ''
  }
}

const head = (title, sub = '', actions = '') => `<header class="ad-head"><div><h1>${title}</h1>${sub ? `<p class="ae-muted">${sub}</p>` : ''}</div><div class="ad-head-actions">${actions}</div></header>`

/* ---------------- overview ---------------- */
async function overview(panel) {
  const counts = {}
  for (const t of ['applications', 'enquiries']) {
    const { count } = await sb.from(t).select('id', { count: 'exact', head: true })
    const { count: fresh } = await sb.from(t).select('id', { count: 'exact', head: true }).eq('status', 'new')
    counts[t] = { all: count || 0, fresh: fresh || 0 }
  }
  const { data: recentApps } = await sb.from('applications').select('id,created_at,first_name,last_name,role,status').order('created_at', { ascending: false }).limit(5)
  panel.innerHTML = `${head(`Welcome back`, 'Everything you need to run acadiacare.co.uk.')}
    <div class="ad-stats">
      <button class="ad-stat" data-go="applications"><strong>${counts.applications.fresh}</strong><span>New applications</span><em>${counts.applications.all} total</em></button>
      <button class="ad-stat" data-go="enquiries"><strong>${counts.enquiries.fresh}</strong><span>New enquiries</span><em>${counts.enquiries.all} total</em></button>
      <a class="ad-stat" href="/?edit"><strong>Edit</strong><span>Open the visual editor</span><em>Click any text, image or video</em></a>
    </div>
    <div class="ad-card"><h2>Latest applications</h2>${(recentApps || []).length ? `<table class="ad-table"><tbody>${recentApps.map((a) => `<tr data-open-app="${a.id}"><td>${fmtDate(a.created_at)}</td><td><b>${escapeHtml(`${a.first_name} ${a.last_name}`)}</b></td><td>${escapeHtml(a.role || '')}</td><td><span class="ad-pill s-${escapeHtml(a.status)}">${escapeHtml(a.status)}</span></td></tr>`).join('')}</tbody></table>` : '<p class="ae-muted">No applications yet.</p>'}</div>
    <div class="ad-card"><h2>How editing works</h2><ol class="ad-steps"><li>Go to <b>Edit website</b> and open any page, or browse the site while signed in.</li><li>Click <b>Edit page</b> in the dark bar at the bottom.</li><li>Click any text to type, use the <b>Image</b>/<b>Video</b> buttons to swap media, or hide whole sections.</li><li>Click <b>Save</b>. Changes go live for every visitor straight away.</li></ol></div>`
  panel.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => openTab(b.dataset.go)))
  panel.querySelectorAll('[data-open-app]').forEach((r) => r.addEventListener('click', () => { openTab('applications'); setTimeout(() => openRecord('applications', r.dataset.openApp), 300) }))
}

/* ---------------- pages ---------------- */
async function pages(panel) {
  const { data: customs } = await sb.from('pages').select('slug,title,published').order('title')
  const all = [...SITE_PAGES.filter((p) => !p.href.includes('#')), ...(customs || []).map((p) => ({ label: `${p.title}${p.published ? '' : ' (draft)'}`, href: `/p/${p.slug}` }))]
  panel.innerHTML = `${head('Edit website', 'Open a page in the visual editor. Edit text, links, images and videos directly on the page, then click Save.')}
    <div class="ad-grid">${all.map((p) => `<div class="ad-card ad-page"><h3>${escapeHtml(p.label)}</h3><p class="ae-muted">${escapeHtml(p.href)}</p><div class="ad-row"><a class="ae-btn ae-btn-primary" href="${escapeHtml(p.href)}${p.href.includes('?') ? '&' : '?'}edit">Edit page</a><a class="ae-btn" href="${escapeHtml(p.href)}" target="_blank" rel="noopener">View</a></div></div>`).join('')}</div>
    <div class="ad-card"><h2>Header and footer</h2><p class="ae-muted">The header, footer and WhatsApp widget are shared by every page. Edit them on any page; menu links are under <b>Menu</b> and contact details under <b>Site settings</b>.</p></div>`
}

/* ---------------- inbox (applications / enquiries) ---------------- */
let inboxRows = []
async function inbox(table, panel = $('#panel')) {
  const status = new URLSearchParams(location.hash.split('?')[1] || '').get('status') || ''
  let q = sb.from(table).select('*').order('created_at', { ascending: false }).limit(500)
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  inboxRows = data || []
  const isApp = table === 'applications'
  panel.innerHTML = `${head(isApp ? 'Applications' : 'Enquiries', isApp ? 'Every job application, with the CV and documents. Each one was also emailed to the office.' : 'Messages from the website forms. Each one was also emailed to the office.', `<button class="ae-btn" data-export>Export CSV</button>`)}
    <div class="ad-filters"><input class="ad-search" placeholder="Search name, email, role…" aria-label="Search"><select class="ad-status-filter" aria-label="Filter by status"><option value="">All statuses</option>${STATUSES[table].map((s) => `<option ${s === status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="ad-card ad-flush"><table class="ad-table ad-list"><thead><tr><th>Received</th><th>Name</th><th>${isApp ? 'Role' : 'Enquiry'}</th><th>Contact</th><th>Status</th></tr></thead><tbody></tbody></table></div>`
  const tbody = panel.querySelector('tbody')
  const render = (term = '') => {
    const t = term.toLowerCase()
    const rows = inboxRows.filter((r) => !t || JSON.stringify(r).toLowerCase().includes(t))
    tbody.innerHTML = rows.length ? rows.map((r) => `<tr data-id="${r.id}" class="${r.status === 'new' ? 'is-new' : ''}">
      <td>${fmtDate(r.created_at)}</td>
      <td><b>${escapeHtml(isApp ? `${r.first_name} ${r.last_name}` : r.name)}</b></td>
      <td>${escapeHtml(isApp ? r.role : (r.type_label || r.type || ''))}</td>
      <td>${escapeHtml(r.email)}<br><span class="ae-muted">${escapeHtml(r.phone || '')}</span></td>
      <td><span class="ad-pill s-${escapeHtml((r.status || '').replace(/\s/g, '-'))}">${escapeHtml(r.status)}</span></td></tr>`).join('') : `<tr><td colspan="5" class="ae-muted" style="text-align:center;padding:40px">Nothing here yet.</td></tr>`
  }
  render()
  panel.querySelector('.ad-search').addEventListener('input', (e) => render(e.target.value))
  panel.querySelector('.ad-status-filter').addEventListener('change', (e) => { history.replaceState(null, '', `#${table}${e.target.value ? `?status=${encodeURIComponent(e.target.value)}` : ''}`); inbox(table, panel) })
  tbody.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) openRecord(table, tr.dataset.id) })
  panel.querySelector('[data-export]').addEventListener('click', () => exportCsv(table, inboxRows))
}

const APP_FIELDS = [
  ['Role', 'role'], ['Email', 'email'], ['Phone', 'phone'], ['Address', (r) => [r.address, r.city, r.postcode].filter(Boolean).join(', ')],
  ['Right to work', 'right_to_work'], ['Driving licence', 'driving_licence'], ['Own vehicle', 'vehicle'], ['DBS', 'dbs'],
  ['Experience', 'experience_level'], ['Experience details', 'experience_detail'], ['Qualifications', 'qualifications'],
  ['Start', 'start_date'], ['Work pattern', 'work_pattern'], ['Employment type', 'employment_type'], ['Travel', 'travel'], ['Cover note', 'cover_note'],
]
async function openRecord(table, id) {
  const r = inboxRows.find((x) => String(x.id) === String(id)) || (await sb.from(table).select('*').eq('id', id).single()).data
  if (!r) return
  const isApp = table === 'applications'
  const fields = isApp ? APP_FIELDS : [['Email', 'email'], ['Phone', 'phone'], ['Enquiry type', (x) => x.type_label || x.type], ['Message', 'message'], ['Sent from', 'page']]
  const files = isApp ? (r.files || []) : []
  const body = el(`<div class="ad-record">
    <div class="ad-row" style="justify-content:space-between;margin-bottom:14px"><span class="ae-muted">Received ${fmtDate(r.created_at)}</span>
      <label class="ae-field" style="margin:0;min-width:180px"><span>Status</span><select data-status>${STATUSES[table].map((s) => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
    <dl class="ad-dl">${fields.map(([label, k]) => { const v = typeof k === 'function' ? k(r) : r[k]; return v ? `<dt>${label}</dt><dd>${escapeHtml(String(v)).replace(/\n/g, '<br>')}</dd>` : '' }).join('')}</dl>
    ${isApp ? `<h4 class="ae-sub">Documents</h4><div class="ad-files">${files.length ? files.map((f, i) => `<button class="ae-btn" data-file="${i}">${I.upload} ${escapeHtml(f.kind === 'cv' ? 'CV: ' : '')}${escapeHtml(f.name)}</button>`).join('') : '<p class="ae-muted">No files stored (they were attached to the email).</p>'}</div>` : ''}
    <label class="ae-field" style="margin-top:16px"><span>Internal notes (only admins see these)</span><textarea data-notes rows="3">${escapeHtml(r.notes || '')}</textarea></label>
    <div class="ad-row"><a class="ae-btn" href="mailto:${escapeHtml(r.email)}">Reply by email</a>${r.phone ? `<a class="ae-btn" href="tel:${escapeHtml(r.phone)}">Call</a>` : ''}</div>
  </div>`)
  body.querySelectorAll('[data-file]').forEach((b) => b.addEventListener('click', async () => {
    const f = files[Number(b.dataset.file)]
    const { data, error } = await sb.storage.from(APPLICATION_BUCKET).createSignedUrl(f.path, 120, { download: f.name })
    if (error) return toast(error.message, 'err')
    window.open(data.signedUrl, '_blank', 'noopener')
  }))
  modal({ title: isApp ? `${r.first_name} ${r.last_name}` : r.name, body, wide: true, actions: [
    { label: 'Delete', danger: true, closes: false, onClick: async (close) => {
      if (!(await confirmBox('Delete permanently?', 'This removes the record and any uploaded documents. This cannot be undone.', 'Delete'))) return false
      if (files.length) await sb.storage.from(APPLICATION_BUCKET).remove(files.map((f) => f.path))
      const { error } = await sb.from(table).delete().eq('id', r.id)
      if (error) { toast(error.message, 'err'); return false }
      close(); toast('Deleted.'); refreshCounts(); inbox(table)
    } },
    { label: 'Close' },
    { label: 'Save', primary: true, onClick: async () => {
      const { error } = await sb.from(table).update({ status: body.querySelector('[data-status]').value, notes: body.querySelector('[data-notes]').value }).eq('id', r.id)
      if (error) { toast(error.message, 'err'); return false }
      toast('Saved.'); refreshCounts(); inbox(table)
    } },
  ] })
}

function exportCsv(table, rows) {
  if (!rows.length) return toast('Nothing to export.', 'err')
  const keys = Object.keys(rows[0]).filter((k) => k !== 'files')
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(typeof r[k] === 'object' ? JSON.stringify(r[k]) : r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `acadia-${table}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

/* ---------------- menu ---------------- */
async function menu(panel) {
  const g = await loadRow(sb, 'global')
  const { data: customs } = await sb.from('pages').select('slug,title').eq('published', true).order('title')
  const ed = navEditor(g.nav, g.cta, customs || [])
  panel.innerHTML = head('Menu', 'The links in the top navigation and mobile menu.', '<button class="ae-btn ae-btn-primary" data-save>Save menu</button>')
  const card = el('<div class="ad-card"></div>'); card.appendChild(ed.el); panel.appendChild(card)
  panel.querySelector('[data-save]').addEventListener('click', async () => {
    const latest = await loadRow(sb, 'global')
    await saveRow(sb, 'global', { ...latest, ...ed.value() })
    toast('Menu saved. It is live now.')
  })
}

/* ---------------- settings ---------------- */
async function settings(panel) {
  const g = await loadRow(sb, 'global')
  const f = settingsForm(g.settings)
  panel.innerHTML = head('Site settings', 'Contact details and links used across the whole website.', '<button class="ae-btn ae-btn-primary" data-save>Save settings</button>')
  const card = el('<div class="ad-card"></div>'); card.appendChild(f.el); panel.appendChild(card)
  panel.appendChild(el(`<div class="ad-card"><h2>Where do form emails go?</h2><p class="ae-muted">Applications and enquiries are emailed to the address set in the server setting <code>ADMIN_EMAIL</code> (currently care@acadiacare.co.uk) and are also saved under Applications and Enquiries here.</p></div>`))
  panel.querySelector('[data-save]').addEventListener('click', async () => {
    const latest = await loadRow(sb, 'global')
    await saveRow(sb, 'global', { ...latest, settings: f.value() })
    toast('Settings saved. They are live now.')
  })
}

/* ---------------- custom pages ---------------- */
async function custom(panel) {
  const { data, error } = await sb.from('pages').select('*').order('updated_at', { ascending: false })
  if (error) throw error
  panel.innerHTML = `${head('Custom pages', 'Create new pages (e.g. a service area, a news post or a special offer), then add them to the menu.', '<button class="ae-btn ae-btn-primary" data-new>New page</button>')}
    <div class="ad-card ad-flush"><table class="ad-table"><thead><tr><th>Title</th><th>Address</th><th>Status</th><th></th></tr></thead><tbody>
    ${(data || []).map((p) => `<tr><td><b>${escapeHtml(p.title)}</b></td><td>/p/${escapeHtml(p.slug)}</td><td><span class="ad-pill ${p.published ? 's-hired' : 's-new'}">${p.published ? 'Published' : 'Draft'}</span></td>
      <td class="ad-actions"><a class="ae-btn" href="/p/${escapeHtml(p.slug)}?edit">Edit content</a><button class="ae-btn" data-props="${escapeHtml(p.slug)}">Details</button></td></tr>`).join('') || '<tr><td colspan="4" class="ae-muted" style="padding:30px;text-align:center">No custom pages yet.</td></tr>'}
    </tbody></table></div>`
  panel.querySelector('[data-new]').addEventListener('click', () => pageForm())
  panel.querySelectorAll('[data-props]').forEach((b) => b.addEventListener('click', () => pageForm(data.find((p) => p.slug === b.dataset.props))))
}
function pageForm(p) {
  const isNew = !p
  p = p || { title: '', slug: '', intro: '', meta_description: '', published: true, body: '<h2>Heading</h2><p>Start writing here.</p>' }
  const body = el(`<div>
    <label class="ae-field"><span>Page title</span><input data-k="title" value="${escapeHtml(p.title)}" required></label>
    <label class="ae-field"><span>Web address: acadiacare.co.uk/p/…</span><input data-k="slug" value="${escapeHtml(p.slug)}" ${isNew ? '' : 'readonly'} placeholder="e.g. live-in-care-lichfield"></label>
    <label class="ae-field"><span>Intro line (under the title)</span><input data-k="intro" value="${escapeHtml(p.intro || '')}"></label>
    <label class="ae-field"><span>Google description (max 160 characters)</span><textarea data-k="meta_description" rows="2" maxlength="160">${escapeHtml(p.meta_description || '')}</textarea></label>
    <label class="ae-check"><input type="checkbox" data-k="published" ${p.published ? 'checked' : ''}> Published (visible to the public)</label>
  </div>`)
  const title = body.querySelector('[data-k=title]'); const slug = body.querySelector('[data-k=slug]')
  if (isNew) title.addEventListener('input', () => { slug.value = title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) })
  const actions = [{ label: 'Cancel' }]
  if (!isNew) actions.unshift({ label: 'Delete page', danger: true, closes: false, onClick: async (close) => {
    if (!(await confirmBox('Delete this page?', 'Remember to remove it from the menu too.', 'Delete'))) return false
    await sb.from('pages').delete().eq('slug', p.slug); close(); toast('Page deleted.'); openTab('custom')
  } })
  actions.push({ label: isNew ? 'Create page' : 'Save', primary: true, onClick: async () => {
    const v = {}
    body.querySelectorAll('[data-k]').forEach((i) => { v[i.dataset.k] = i.type === 'checkbox' ? i.checked : i.value.trim() })
    v.slug = v.slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!v.title || !v.slug) { toast('Title and web address are required.', 'err'); return false }
    const row = { ...v, updated_at: new Date().toISOString(), ...(isNew ? { body: sanitize(p.body, 'block') } : {}) }
    const { error } = isNew ? await sb.from('pages').insert(row) : await sb.from('pages').update(row).eq('slug', p.slug)
    if (error) { toast(error.message.includes('duplicate') ? 'That web address is already used.' : error.message, 'err'); return false }
    toast(isNew ? 'Page created. Opening the editor…' : 'Saved.')
    if (isNew) setTimeout(() => { location.href = `/p/${v.slug}?edit` }, 600); else openTab('custom')
  } })
  modal({ title: isNew ? 'New page' : 'Page details', body, actions })
}

/* ---------------- media ---------------- */
async function media(panel) {
  panel.innerHTML = `${head('Media library', 'Images and videos uploaded for the website. Upload here, or straight from the visual editor.')}
    <div class="ad-card"><label class="ae-drop">${I.upload}<strong>Upload images or videos</strong><span>Images up to 10MB, videos up to 50MB</span><input type="file" multiple accept="image/*,video/mp4,video/webm"></label><div class="ae-upload-status ae-muted"></div></div>
    <div class="ad-media-grid"><p class="ae-muted">Loading…</p></div>`
  const grid = panel.querySelector('.ad-media-grid')
  const load = async () => {
    const files = await listMedia(sb)
    grid.innerHTML = files.length ? '' : '<p class="ae-muted">No uploads yet.</p>'
    files.forEach((f) => {
      const card = el(`<div class="ad-media-item">${f.type.startsWith('video') ? `<video src="${escapeHtml(f.url)}#t=0.5" muted preload="metadata"></video>` : `<img src="${escapeHtml(f.url)}" alt="" loading="lazy">`}
        <div class="ad-row"><button class="ae-btn" data-copy>Copy URL</button><button class="ae-icon-btn danger" data-del title="Delete">${I.trash}</button></div></div>`)
      card.querySelector('[data-copy]').onclick = () => navigator.clipboard.writeText(f.url).then(() => toast('URL copied.'))
      card.querySelector('[data-del]').onclick = async () => {
        if (!(await confirmBox('Delete this file?', 'If it is used on a page, that page will show a broken image until you replace it.', 'Delete'))) return
        await sb.storage.from('media').remove([f.path]); load()
      }
      grid.appendChild(card)
    })
  }
  panel.querySelector('input[type=file]').addEventListener('change', async (e) => {
    const status = panel.querySelector('.ae-upload-status')
    for (const file of e.target.files) {
      status.textContent = `Uploading ${file.name}…`
      try { await uploadMedia(sb, file) } catch (err) { toast(`${file.name}: ${err.message}`, 'err') }
    }
    status.textContent = 'Done.'
    load()
  })
  load()
}

/* ---------------- account ---------------- */
async function account(panel) {
  panel.innerHTML = `${head('Account', `Signed in as ${escapeHtml(user.email)}`)}
    <div class="ad-card" style="max-width:520px"><h2>Change password</h2>
      <form class="ad-form" id="pwForm"><label class="ae-field"><span>New password (min 10 characters)</span><input type="password" name="p" minlength="10" required autocomplete="new-password"></label>
      <label class="ae-field"><span>Confirm</span><input type="password" name="c" minlength="10" required autocomplete="new-password"></label>
      <button class="ae-btn ae-btn-primary" type="submit">Update password</button></form></div>
    <div class="ad-card" style="max-width:520px"><h2>Adding another admin</h2><p class="ae-muted">1. In Supabase, go to Authentication → Users → Add user and create their login.<br>2. In Table Editor → <code>admins</code>, add a row with their email address.</p></div>`
  panel.querySelector('#pwForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    if (fd.get('p') !== fd.get('c')) return toast('Passwords do not match.', 'err')
    const { error } = await sb.auth.updateUser({ password: fd.get('p') })
    if (error) return toast(error.message, 'err')
    e.target.reset(); toast('Password updated.')
  })
}

boot()
