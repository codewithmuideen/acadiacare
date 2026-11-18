/** Shared form helpers + the general contact/enquiry form. */
import { escapeHtml } from './sanitize.js'
import { settings } from './cms.js'

const ICON_OK = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
const ICON_ERR = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'

export function showAlert(el, msg, ok = false) {
  if (!el) return
  el.innerHTML = `<div class="alert ${ok ? 'a-ok' : 'a-err'}">${ok ? ICON_OK : ICON_ERR}<span>${msg}</span></div>`
}
export const clearAlert = (el) => { if (el) el.innerHTML = '' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+()\d\s-]{7,20}$/

export function validateFields(fields) {
  let firstBad = null
  fields.forEach((f) => {
    let ok = true
    const v = f.type === 'checkbox' ? f.checked : f.type === 'file' ? f.files.length > 0 : f.value.trim()
    if (f.required && !v) ok = false
    else if (f.type === 'email' && f.value && !EMAIL.test(f.value.trim())) ok = false
    else if (f.type === 'tel' && f.value && !PHONE.test(f.value.trim())) ok = false
    f.classList.toggle('invalid', !ok)
    f.setAttribute('aria-invalid', ok ? 'false' : 'true')
    if (f.type === 'file') f.closest('.file-up')?.classList.toggle('invalid', !ok)
    if (!ok && !firstBad) firstBad = f
  })
  if (firstBad) firstBad.focus({ preventScroll: false })
  return !firstBad
}

export function fallbackContact() {
  const s = settings()
  return `Please call <a href="tel:${escapeHtml(s.phone)}"><strong>${escapeHtml(s.phone)}</strong></a> or email <a href="mailto:${escapeHtml(s.email)}"><strong>${escapeHtml(s.email)}</strong></a>.`
}

export function setBusy(btn, busy, label) {
  if (!btn) return
  if (busy) {
    btn.dataset.html = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = `<span class="spin"></span> ${label}`
  } else {
    btn.disabled = false
    if (btn.dataset.html) btn.innerHTML = btn.dataset.html
  }
}

export async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  let data = {}
  try { data = await res.json() } catch { /* non-JSON error page */ }
  if (!res.ok || !data.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
  return data
}

export function initContactForms() {
  const preset = new URLSearchParams(location.search).get('type')
  document.querySelectorAll('.js-contact-form').forEach((form) => {
    form.querySelectorAll('input,select,textarea').forEach((f) => f.addEventListener('input', () => f.classList.remove('invalid')))
    if (preset) {
      const sel = form.querySelector('select[name="type"]')
      if (sel && [...sel.options].some((o) => o.value === preset)) sel.value = preset
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const alertEl = form.querySelector('.form-alert')
      clearAlert(alertEl)
      if (!validateFields([...form.querySelectorAll('[required]')])) {
        showAlert(alertEl, 'Please complete the highlighted fields.')
        return
      }
      const btn = form.querySelector('[type="submit"]')
      const fd = new FormData(form)
      const sel = form.querySelector('select[name="type"]')
      const body = {
        formType: form.dataset.formType || 'enquiry',
        name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
        type: fd.get('type'), typeLabel: sel?.selectedOptions[0]?.textContent || '',
        message: fd.get('message'), consent: !!fd.get('consent'),
        company: fd.get('company') || '', page: location.pathname,
      }
      setBusy(btn, true, 'Sending...')
      try {
        await postJson('/api/contact', body)
        form.reset()
        showAlert(alertEl, `Thank you, ${escapeHtml(String(body.name).split(' ')[0])}. Your message has been sent and we have emailed you a confirmation. We will be in touch within one working day.`, true)
      } catch (err) {
        console.error(err)
        showAlert(alertEl, `Sorry, we could not send your message just now. ${fallbackContact()}`)
      } finally {
        setBusy(btn, false)
      }
    })
  })
}
