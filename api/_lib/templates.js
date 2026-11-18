import { esc } from './http.js'

const PINK = '#df3fb6'
const site = () => process.env.SITE_URL || 'https://acadiacare.co.uk'
const phone = () => process.env.PUBLIC_PHONE || '07949 720 932'

/** Branded, email-client-safe layout (tables + inline styles). */
export function layout({ title, preheader = '', body }) {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f8f0f7;font-family:Arial,Helvetica,sans-serif;color:#1a1020">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f0f7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0ddf0">
<tr><td style="background:${PINK};background:linear-gradient(135deg,#b8279a,${PINK});padding:26px 30px;color:#ffffff">
<div style="font-size:22px;font-weight:bold;letter-spacing:.3px">Acadia Care</div>
<div style="font-size:12px;opacity:.9;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px">Acadia Support Services Ltd</div></td></tr>
<tr><td style="padding:30px">
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;line-height:1.3;margin:0 0 16px;color:#1a1020">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 30px;background:#fce8f7;font-size:12px;line-height:1.6;color:#6b5a70">
Acadia Support Services Ltd &middot; Whittle Rise, Staffordshire Technology Park, Stafford, ST18 0ES<br>
<a href="tel:${esc(phone().replace(/\s/g, ''))}" style="color:#b8279a">${esc(phone())}</a> &middot; <a href="mailto:care@acadiacare.co.uk" style="color:#b8279a">care@acadiacare.co.uk</a> &middot; <a href="${esc(site())}" style="color:#b8279a">acadiacare.co.uk</a>
</td></tr></table></td></tr></table></body></html>`
}

export const p = (text) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#5a4060">${text}</p>`

export function fieldsTable(rows) {
  const tr = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `<tr><td style="padding:9px 12px;border-bottom:1px solid #f6eaf6;font-size:13px;color:#8a6f90;width:38%;vertical-align:top"><b>${esc(k)}</b></td><td style="padding:9px 12px;border-bottom:1px solid #f6eaf6;font-size:14px;color:#1a1020">${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`).join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ddf0;border-radius:10px;border-collapse:separate;margin:6px 0 18px">${tr}</table>`
}

export const button = (href, label) => `<p style="margin:20px 0"><a href="${esc(href)}" style="background:${PINK};color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block">${esc(label)}</a></p>`

export const textVersion = (title, rows) => `${title}\n\n${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}\n`
