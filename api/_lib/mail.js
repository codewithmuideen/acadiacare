/**
 * Shared helpers for the serverless email endpoints (Vercel-style Node functions).
 *
 * SECURITY
 * - RESEND_API_KEY is read from server environment variables only. It is never
 *   exposed to the browser (never prefix it with VITE_).
 * - These endpoints handle NON-SENSITIVE enquiries only. Staff applications with
 *   health or criminal-record data must never be sent through here.
 */
import { z } from 'zod'

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().regex(/^[+()\d\s-]{7,20}$/),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional().or(z.literal('')), // honeypot
  type: z.enum(['contact', 'recruitment']).optional(),
  page: z.string().max(200).optional(),
})

const escape = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

/** Basic method / origin / size checks shared by every endpoint. */
export async function readRequest(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    json(res, 405, { ok: false, error: 'Method not allowed.' })
    return null
  }
  const allowed = process.env.ALLOWED_ORIGIN
  const origin = req.headers.origin
  if (allowed && origin && origin !== allowed) {
    json(res, 403, { ok: false, error: 'Origin not allowed.' })
    return null
  }
  let body = req.body
  if (!body || typeof body === 'string') {
    try {
      body = typeof body === 'string' ? JSON.parse(body) : await new Promise((resolve, reject) => {
        let data = ''
        req.on('data', (chunk) => {
          data += chunk
          if (data.length > 50_000) reject(new Error('too large'))
        })
        req.on('end', () => resolve(JSON.parse(data || '{}')))
        req.on('error', reject)
      })
    } catch {
      json(res, 400, { ok: false, error: 'Invalid request.' })
      return null
    }
  }
  return body
}

/**
 * Sends an email via the Resend REST API. Returns { ok, id } or throws.
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */
export async function sendWithResend({ to, subject, replyTo, fields }) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!key || !from || !to) {
    const err = new Error('Email delivery is not configured.')
    err.code = 'not-configured'
    throw err
  }

  const rows = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#6B665E;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="padding:8px 12px;color:#1F1A17;white-space:pre-wrap">${escape(v)}</td></tr>`,
    )
    .join('')
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px"><h2 style="color:#B01F80;font-weight:600">${escape(subject)}</h2><table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table><p style="color:#6B665E;font-size:12px;margin-top:24px">Sent from the acadiacare.co.uk website.</p></div>`
  const text = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      subject,
      html,
      text,
      reply_to: replyTo,
    }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    const err = new Error(data?.message || `Resend error (${r.status})`)
    err.code = 'provider-error'
    throw err
  }
  return { ok: true, id: data.id }
}

/** Shared handler body for contact + recruitment enquiries. */
export async function handleEnquiry(req, res, { to, label }) {
  const body = await readRequest(req, res)
  if (!body) return

  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) return json(res, 422, { ok: false, error: 'Please check the form and try again.' })
  const v = parsed.data

  // Honeypot filled → silently accept without sending (bots get no signal).
  if (v.website) return json(res, 200, { ok: true })

  // TODO(rate-limit): add per-IP rate limiting (e.g. Upstash Ratelimit / Vercel KV)
  // and optionally Cloudflare Turnstile before going live.

  try {
    await sendWithResend({
      to,
      subject: `${label}: ${v.subject} from ${v.name}`,
      replyTo: v.email,
      fields: { Name: v.name, Email: v.email, Phone: v.phone, Subject: v.subject, Message: v.message, Page: v.page || '' },
    })
    return json(res, 200, { ok: true })
  } catch (err) {
    if (err.code === 'not-configured') {
      return json(res, 501, { ok: false, code: 'not-configured', error: 'Online messages aren’t connected yet. Please call or email us directly.' })
    }
    console.error('[enquiry] send failed:', err.message)
    return json(res, 502, { ok: false, error: 'We couldn’t send your message just now. Please try again or contact us directly.' })
  }
}
