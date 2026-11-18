/** Request helpers shared by the API endpoints (Vercel Node functions). */

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

/** POST-only, same-origin, size-limited JSON body. Returns body or null (response already sent). */
export async function readJson(req, res, limit = 6_000_000) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    json(res, 405, { ok: false, error: 'Method not allowed.' })
    return null
  }
  const allowed = (process.env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
  const origin = req.headers.origin
  if (allowed.length && origin && !allowed.includes(origin)) {
    json(res, 403, { ok: false, error: 'Origin not allowed.' })
    return null
  }
  try {
    if (req.body && typeof req.body === 'object') return req.body
    if (typeof req.body === 'string') return JSON.parse(req.body)
    const raw = await new Promise((resolve, reject) => {
      let data = ''
      req.on('data', (c) => { data += c; if (data.length > limit) reject(new Error('too large')) })
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })
    return JSON.parse(raw || '{}')
  } catch {
    json(res, 400, { ok: false, error: 'Invalid request.' })
    return null
  }
}

/** Best-effort in-memory rate limit per IP (resets when the function cold-starts). */
const hits = new Map()
export function rateLimited(req, max = 8, windowMs = 10 * 60 * 1000) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs)
  list.push(now)
  hits.set(ip, list)
  return list.length > max
}

export const str = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
export const isPhone = (v) => /^[+()\d\s-]{7,20}$/.test(v)
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
