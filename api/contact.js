/**
 * POST /api/contact — every general website form (contact, home page, staffing...).
 * 1. validates  2. saves to Supabase "enquiries"  3. emails the office
 * 4. emails the sender a confirmation copy.
 */
import { json, readJson, rateLimited, str, isEmail, isPhone, esc } from './_lib/http.js'
import { sendEmail, emailConfigured } from './_lib/resend.js'
import { insert, dbConfigured } from './_lib/supabase.js'
import { layout, p, fieldsTable, textVersion, button } from './_lib/templates.js'

export default async function handler(req, res) {
  const body = await readJson(req, res, 60_000)
  if (!body) return
  if (body.company) return json(res, 200, { ok: true }) // honeypot: silently accept bots
  if (rateLimited(req)) return json(res, 429, { ok: false, error: 'Too many messages. Please try again later or call us.' })

  const d = {
    form_type: str(body.formType || 'enquiry', 40),
    name: str(body.name, 100),
    email: str(body.email, 200).toLowerCase(),
    phone: str(body.phone, 20),
    type: str(body.type, 40),
    type_label: str(body.typeLabel, 120),
    message: str(body.message, 5000),
    page: str(body.page, 200),
  }
  const errors = []
  if (d.name.length < 2) errors.push('name')
  if (!isEmail(d.email)) errors.push('email')
  if (!isPhone(d.phone)) errors.push('phone')
  if (d.message.length < 2) errors.push('message')
  if (!body.consent) errors.push('consent')
  if (errors.length) return json(res, 400, { ok: false, error: `Please check: ${errors.join(', ')}.` })

  const admin = process.env.ADMIN_EMAIL || 'care@acadiacare.co.uk'
  const first = d.name.split(' ')[0]
  const rows = [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Enquiry type', d.type_label || d.type], ['Message', d.message], ['Sent from', d.page]]
  const results = { stored: false, adminEmail: false, confirmation: false }

  if (dbConfigured()) {
    try { await insert('enquiries', d); results.stored = true } catch (err) { console.error('[contact] db', err.message) }
  }

  if (emailConfigured()) {
    try {
      await sendEmail({
        to: admin,
        replyTo: d.email,
        subject: `New website enquiry: ${d.type_label || 'General'} from ${d.name}`,
        html: layout({ title: 'New website enquiry', preheader: `${d.name}: ${d.message.slice(0, 90)}`, body: `${p(`<b>${esc(d.name)}</b> sent a message through the website. Reply to this email to answer them directly.`)}${fieldsTable(rows)}` }),
        text: textVersion('New website enquiry', rows),
      })
      results.adminEmail = true
    } catch (err) { console.error('[contact] admin email', err.message) }
    try {
      await sendEmail({
        to: d.email,
        replyTo: admin,
        subject: 'We have received your message | Acadia Care',
        html: layout({ title: `Thank you, ${first}`, preheader: 'We will be in touch within one working day.', body: `${p('Thank you for getting in touch with Acadia Care. A member of our team will reply within one working day.')}${p('If your enquiry is urgent, please call us on <b>07949 720 932</b> (24/7 emergency line) or message us on WhatsApp.')}${p('<b>A copy of your message</b>')}${fieldsTable(rows.slice(0, 5))}${button('https://wa.me/447949720932', 'Chat on WhatsApp')}${p('Warm regards,<br>The Acadia Care Team')}` }),
        text: `Thank you, ${first}.\n\nWe have received your message and will reply within one working day. Urgent? Call 07949 720 932.\n\n${textVersion('Your message', rows.slice(0, 5))}`,
      })
      results.confirmation = true
    } catch (err) { console.error('[contact] confirmation email', err.message) }
  }

  if (!results.stored && !results.adminEmail) return json(res, 503, { ok: false, error: 'Our message service is temporarily unavailable.' })
  return json(res, 200, { ok: true, ...results })
}
