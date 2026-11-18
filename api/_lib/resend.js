/**
 * Resend REST API (https://resend.com/docs/api-reference/emails/send-email).
 * RESEND_API_KEY is server-side only.
 *
 * If the sending domain is not verified yet, Resend rejects the "from" address.
 * In that case we retry once from Resend's shared test sender so the office
 * still gets notified (Resend only lets the test sender reach the account
 * owner's own address, so verify acadiacare.co.uk in Resend for production).
 */
const FALLBACK_FROM = 'Acadia Care <onboarding@resend.dev>'

export const emailConfigured = () => !!process.env.RESEND_API_KEY

async function post(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function sendEmail({ to, subject, html, text, replyTo, attachments }) {
  if (!emailConfigured()) throw Object.assign(new Error('Email is not configured (RESEND_API_KEY).'), { code: 'not-configured' })
  const from = process.env.RESEND_FROM || 'Acadia Care <website@acadiacare.co.uk>'
  const payload = {
    from,
    to: Array.isArray(to) ? to : String(to).split(',').map((s) => s.trim()).filter(Boolean),
    subject,
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(attachments?.length ? { attachments } : {}),
  }
  let r = await post(payload)
  if (!r.ok && (r.status === 403 || r.status === 422) && /domain|verify|from/i.test(JSON.stringify(r.data)) && from !== FALLBACK_FROM) {
    console.warn('[resend] sender rejected, retrying with test sender:', r.data?.message)
    r = await post({ ...payload, from: FALLBACK_FROM })
  }
  if (!r.ok) throw Object.assign(new Error(r.data?.message || `Resend error ${r.status}`), { status: r.status })
  return r.data
}
