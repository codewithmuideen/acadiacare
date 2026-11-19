/**
 * GET /sitemap-pages.xml (rewritten here by vercel.json)
 * Lists every published custom page created in the admin, so search engines
 * find new pages automatically.
 */
export default async function handler(req, res) {
  const site = (process.env.SITE_URL_CANONICAL || 'https://acadiacare.co.uk').replace(/\/$/, '')
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  let rows = []
  if (url && key) {
    try {
      const headers = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) }
      const r = await fetch(`${url}/rest/v1/pages?select=slug,updated_at&published=eq.true&order=updated_at.desc`, { headers })
      if (r.ok) rows = await r.json()
    } catch { /* fall back to an empty, valid sitemap */ }
  }
  const esc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])
  const body = rows.map((p) => `  <url><loc>${esc(`${site}/p/${p.slug}`)}</loc><lastmod>${esc((p.updated_at || '').slice(0, 10))}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n')
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
}
