/**
 * POST /api/application — job applications.
 * 1. validates  2. fetches the uploaded CV/documents from PRIVATE Supabase Storage
 * 3. builds a PDF summary of the application  4. saves the application row
 * 5. emails care@ with the PDF + CV + documents attached (reply-to = applicant)
 * 6. emails the applicant a confirmation with a copy of their application PDF.
 */
import { json, readJson, rateLimited, str, isEmail, isPhone, esc } from './_lib/http.js'
import { sendEmail, emailConfigured } from './_lib/resend.js'
import { insert, update, download, move, dbConfigured } from './_lib/supabase.js'
import { applicationPdf } from './_lib/pdf.js'
import { layout, p, fieldsTable, textVersion, button } from './_lib/templates.js'

export const config = { maxDuration: 30 }

const BUCKET = 'applications'
const MAX_FILE = 5 * 1024 * 1024
const OK_EXT = /\.(pdf|docx?|jpe?g|png)$/i

export default async function handler(req, res) {
  const body = await readJson(req, res, 5_000_000)
  if (!body) return
  if (body.company) return json(res, 200, { ok: true }) // honeypot
  if (rateLimited(req, 5)) return json(res, 429, { ok: false, error: 'Too many submissions. Please try again later or call us.' })

  const f = {
    first_name: str(body.first_name, 60), last_name: str(body.last_name, 60),
    email: str(body.email, 200).toLowerCase(), phone: str(body.phone, 20),
    address: str(body.address, 200), city: str(body.city, 80), postcode: str(body.postcode, 10).toUpperCase(),
    role: str(body.role, 80), right_to_work: str(body.right_to_work, 80), driving_licence: str(body.driving_licence, 80),
    vehicle: str(body.vehicle, 20), dbs: str(body.dbs, 80), experience_level: str(body.experience_level, 80),
    experience_detail: str(body.experience_detail, 4000), qualifications: str(body.qualifications, 3000),
    start_date: str(body.start_date, 60), work_pattern: str(body.work_pattern, 60), employment_type: str(body.employment_type, 60),
    travel: str(body.travel, 60), cover_note: str(body.cover_note, 4000),
  }
  const missing = ['first_name', 'last_name', 'address', 'city', 'postcode', 'role', 'right_to_work', 'driving_licence', 'vehicle', 'experience_level', 'start_date', 'work_pattern'].filter((k) => !f[k])
  if (!isEmail(f.email)) missing.push('email')
  if (!isPhone(f.phone)) missing.push('phone')
  if (!body.consent) missing.push('consent')
  const files = Array.isArray(body.files) ? body.files.slice(0, 5) : []
  if (!files.some((x) => x.kind === 'cv')) missing.push('cv')
  if (missing.length) return json(res, 400, { ok: false, error: `Please check: ${missing.join(', ')}.` })

  // Collect attachments (from storage, or inline base64 fallback)
  const attachments = []
  const stored = []
  try {
    for (const file of files) {
      const name = str(file.name, 120).replace(/[\\/]/g, '_') || 'document'
      if (!OK_EXT.test(name)) throw new Error(`Unsupported file type: ${name}`)
      let buf
      if (file.path) {
        const path = str(file.path, 300)
        if (!/^incoming\/[\w-]+\/[\w.-]+$/.test(path)) throw new Error('Invalid file path')
        buf = await download(BUCKET, path)
        stored.push({ path, name, type: str(file.type, 100), size: buf.length, kind: file.kind === 'cv' ? 'cv' : 'supporting' })
      } else if (file.base64) {
        buf = Buffer.from(String(file.base64), 'base64')
      } else continue
      if (buf.length > MAX_FILE) throw new Error(`${name} is larger than 5MB`)
      attachments.push({ filename: `${file.kind === 'cv' ? 'CV' : 'Document'} - ${name}`, content: buf.toString('base64') })
    }
  } catch (err) {
    console.error('[application] files', err.message)
    return json(res, 400, { ok: false, error: 'We could not read your uploaded documents. Please try again.' })
  }

  const full = `${f.first_name} ${f.last_name}`
  const received = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'long', timeStyle: 'short' })
  const sections = [
    { heading: 'Personal details', rows: [['Name', full], ['Email', f.email], ['Phone', f.phone], ['Address', `${f.address}, ${f.city}, ${f.postcode}`], ['Role applied for', f.role]] },
    { heading: 'Right to work', rows: [['Right to work in UK', f.right_to_work], ['Driving licence', f.driving_licence], ['Own vehicle', f.vehicle], ['DBS certificate', f.dbs]] },
    { heading: 'Experience', rows: [['Care experience', f.experience_level], ['Experience details', f.experience_detail], ['Qualifications', f.qualifications]] },
    { heading: 'Availability', rows: [['Can start', f.start_date], ['Work pattern', f.work_pattern], ['Employment type', f.employment_type], ['Travel distance', f.travel], ['Cover note', f.cover_note]] },
    { heading: 'Documents', rows: files.map((x, i) => [x.kind === 'cv' ? 'CV' : `Document ${i}`, str(x.name, 120)]) },
  ]
  const pdf = await applicationPdf({ title: `Job application: ${full}`, subtitle: `${f.role}  |  received ${received}`, sections })
  const pdfName = `Application - ${full.replace(/[^\w\s-]/g, '')} - ${f.role.replace(/[^\w\s()-]/g, '')}.pdf`

  // Save to Supabase (files grouped under the application id)
  let appId = null
  if (dbConfigured()) {
    try {
      const row = await insert('applications', { ...f, files: stored, status: 'new' })
      appId = row?.id
      if (appId && stored.length) {
        const moved = []
        for (const s of stored) {
          const dest = `${appId}/${s.path.split('/').pop()}`
          try { await move(BUCKET, s.path, dest); moved.push({ ...s, path: dest }) } catch { moved.push(s) }
        }
        await update('applications', { id: appId }, { files: moved })
      }
    } catch (err) { console.error('[application] db', err.message) }
  }

  const admin = process.env.ADMIN_EMAIL || 'care@acadiacare.co.uk'
  const rows = sections.flatMap((s) => s.rows)
  let adminSent = false
  if (emailConfigured()) {
    try {
      await sendEmail({
        to: admin,
        replyTo: f.email,
        subject: `New job application: ${full} (${f.role})`,
        html: layout({ title: 'New job application', preheader: `${full} applied for ${f.role}`, body: `${p(`<b>${esc(full)}</b> has applied for <b>${esc(f.role)}</b>. Their full application (PDF), CV and documents are attached. Reply to this email to contact them directly.`)}${fieldsTable(rows)}${appId ? button(`${process.env.SITE_URL || 'https://acadiacare.co.uk'}/admin#applications`, 'Open in admin dashboard') : ''}` }),
        text: textVersion(`New job application: ${full}`, rows),
        attachments: [{ filename: pdfName, content: pdf.toString('base64') }, ...attachments],
      })
      adminSent = true
    } catch (err) { console.error('[application] admin email', err.message) }

    try {
      await sendEmail({
        to: f.email,
        replyTo: admin,
        subject: 'Your application to Acadia Care',
        html: layout({ title: `Thank you for applying, ${f.first_name}`, preheader: 'We have received your application.', body: `${p(`We have received your application for <b>${esc(f.role)}</b>. Thank you for your interest in joining Acadia Care.`)}${p('<b>What happens next?</b> A member of our recruitment team will review your application and contact you within 2 working days. A copy of your application is attached for your records.')}${p('Questions in the meantime? Call <b>07949 720 932</b> or message us on WhatsApp.')}${button('https://wa.me/447949720932', 'Chat on WhatsApp')}${p('Warm regards,<br>The Acadia Care Recruitment Team')}` }),
        text: `Thank you for applying, ${f.first_name}.\n\nWe have received your application for ${f.role} and will contact you within 2 working days. A copy is attached.\n\nAcadia Care | 07949 720 932`,
        attachments: [{ filename: pdfName, content: pdf.toString('base64') }],
      })
    } catch (err) { console.error('[application] applicant email', err.message) }
  }

  if (!appId && !adminSent) return json(res, 503, { ok: false, error: 'Our application service is temporarily unavailable.' })
  return json(res, 200, { ok: true, id: appId, emailed: adminSent })
}
