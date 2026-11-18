/**
 * 5-step job application.
 * Files go straight from the browser to a PRIVATE Supabase Storage bucket
 * (anonymous visitors can upload but never read), then /api/application emails
 * everything to the office with the CV, documents and a PDF summary attached.
 */
import { CMS_ENABLED, APPLICATION_BUCKET } from './config.js'
import { showAlert, clearAlert, validateFields, setBusy, postJson, fallbackContact } from './forms.js'
import { getClient, safeFileName, uuid } from './supabase.js'

const MAX = 5 * 1024 * 1024
const CV_EXT = /\.(pdf|docx?)$/i
const DOC_EXT = /\.(pdf|docx?|jpe?g|png)$/i

export function initApplication() {
  const form = document.getElementById('appForm')
  if (!form) return
  const pages = [...form.querySelectorAll('[data-step-page]')]
  const tabs = [...document.querySelectorAll('#formProg .pt')]
  const bar = document.getElementById('pbar')
  const alertEl = document.getElementById('appAlert')
  let step = 0
  let furthest = 0

  const go = (s) => {
    pages.forEach((p, i) => p.classList.toggle('active', i === s))
    tabs.forEach((t, i) => { t.classList.toggle('active', i === s); t.classList.toggle('done', i < s); t.setAttribute('aria-selected', String(i === s)) })
    if (bar) bar.style.width = `${((s + 1) / pages.length) * 100}%`
    step = s
    furthest = Math.max(furthest, s)
    clearAlert(alertEl)
    const box = form.closest('.form-box')
    if (box && box.getBoundingClientRect().top < 0) box.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const validStep = (s) => {
    const ok = validateFields([...pages[s].querySelectorAll('[required]')])
    if (!ok) showAlert(alertEl, 'Please fill in all required fields.')
    return ok
  }

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { if (validStep(step)) go(step + 1) }
    if (e.target.closest('[data-prev]')) go(step - 1)
  })
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    if (i <= furthest) go(i)
    else if (i === step + 1 && validStep(step)) go(i)
  }))
  form.querySelectorAll('input,select,textarea').forEach((f) => f.addEventListener('input', () => f.classList.remove('invalid')))

  // File pickers: label + drag/drop styling + client-side checks
  form.querySelectorAll('[data-drop]').forEach((zone) => {
    const input = zone.querySelector('input[type=file]')
    const label = zone.querySelector('[data-file-label]')
    const def = label.textContent
    input.addEventListener('change', () => {
      const names = [...input.files].map((f) => f.name)
      label.textContent = names.length ? names.join(', ') : def
      zone.classList.toggle('has-file', names.length > 0)
      zone.classList.remove('invalid')
    })
    ;['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, () => zone.classList.add('drag')))
    ;['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, () => zone.classList.remove('drag')))
  })

  // Vacancy list: click a role → jump to the form with that role selected
  document.querySelectorAll('[data-role]').forEach((row) => row.addEventListener('click', (e) => {
    if (document.documentElement.classList.contains('cms-editing')) return
    e.preventDefault()
    const sel = form.querySelector('select[name="role"]')
    const opt = [...sel.options].find((o) => o.value === row.dataset.role || o.textContent === row.dataset.role)
    if (opt) { sel.value = opt.value; sel.classList.remove('invalid') }
    go(0)
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', '#apply')
    setTimeout(() => form.querySelector('input[name="first_name"]')?.focus({ preventScroll: true }), 700)
  }))

  const success = document.getElementById('appSuccess')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearAlert(alertEl)
    if (!validStep(step)) return

    const cv = form.querySelector('#cvUp').files[0]
    const supporting = [...form.querySelector('#supUp').files]
    if (!cv || !CV_EXT.test(cv.name)) return showAlert(alertEl, 'Please upload your CV as a PDF, DOC or DOCX file.')
    if (cv.size > MAX) return showAlert(alertEl, 'Your CV is larger than 5MB. Please upload a smaller file.')
    if (supporting.length > 4) return showAlert(alertEl, 'Please upload no more than 4 supporting documents.')
    const bad = supporting.find((f) => f.size > MAX || !DOC_EXT.test(f.name))
    if (bad) return showAlert(alertEl, `"${bad.name}" must be a PDF, Word, JPG or PNG file under 5MB.`)

    const btn = document.getElementById('appBtn')
    setBusy(btn, true, 'Uploading documents...')
    const fd = new FormData(form)
    const fields = {}
    for (const [k, v] of fd.entries()) if (typeof v === 'string') fields[k] = v.trim()
    fields.consent = !!fd.get('consent')

    try {
      const files = [{ file: cv, kind: 'cv' }, ...supporting.map((file) => ({ file, kind: 'supporting' }))]
      let uploaded
      if (CMS_ENABLED) {
        const sb = await getClient()
        const folder = `incoming/${uuid()}`
        uploaded = await Promise.all(files.map(async ({ file, kind }, i) => {
          const path = `${folder}/${i}-${safeFileName(file.name)}`
          const { error } = await sb.storage.from(APPLICATION_BUCKET).upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
          if (error) throw error
          return { path, name: file.name, type: file.type, size: file.size, kind }
        }))
      } else {
        // No storage configured: send files inline (small files only).
        const total = files.reduce((n, f) => n + f.file.size, 0)
        if (total > 3 * 1024 * 1024) throw new Error('Files too large for inline upload.')
        uploaded = await Promise.all(files.map(async ({ file, kind }) => ({ name: file.name, type: file.type, size: file.size, kind, base64: await toBase64(file) })))
      }
      setBusy(btn, false); setBusy(btn, true, 'Submitting...')
      await postJson('/api/application', { ...fields, files: uploaded, page: location.pathname })
      form.hidden = true
      document.getElementById('formProg').hidden = true
      document.querySelector('.pbar').hidden = true
      success.classList.add('show')
      success.focus()
      success.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch (err) {
      console.error(err)
      showAlert(alertEl, `Sorry, we could not submit your application just now. Your details have not been lost: please try again in a moment, or ${fallbackContact().replace(/^Please /, '')}`)
    } finally {
      setBusy(btn, false)
    }
  })
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1])
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
