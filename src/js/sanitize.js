/**
 * Small allow-list HTML sanitiser for CMS content. Content can only be written by
 * admins (enforced by Supabase RLS), but we still sanitise on save and on render.
 */
const INLINE = { B: [], STRONG: [], I: [], EM: [], U: [], BR: [], SPAN: [], A: ['href', 'target', 'rel'] }
const BLOCK = {
  ...INLINE,
  P: [], H2: [], H3: [], H4: [], UL: [], OL: [], LI: [], BLOCKQUOTE: [], HR: [],
  IMG: ['src', 'alt'], VIDEO: ['src', 'poster', 'controls', 'playsinline'], FIGURE: [], FIGCAPTION: [],
  IFRAME: ['src', 'title', 'allowfullscreen'],
}
const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\.\/)/i
const SAFE_IFRAME = /^https:\/\/(www\.youtube(-nocookie)?\.com|player\.vimeo\.com|www\.google\.com\/maps)\//i

export function safeUrl(u = '') {
  const v = String(u).trim()
  return SAFE_URL.test(v) ? v : ''
}

function clean(node, allow) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 3) continue
    if (child.nodeType !== 1) { child.remove(); continue }
    const tag = child.tagName
    if (!allow[tag]) {
      if (['SCRIPT', 'STYLE', 'OBJECT', 'EMBED', 'TEMPLATE'].includes(tag)) { child.remove(); continue }
      clean(child, allow)
      child.replaceWith(...child.childNodes)
      continue
    }
    for (const attr of [...child.attributes]) {
      if (!allow[tag].includes(attr.name)) child.removeAttribute(attr.name)
    }
    for (const a of ['href', 'src', 'poster']) {
      if (child.hasAttribute(a)) {
        const ok = tag === 'IFRAME' ? SAFE_IFRAME.test(child.getAttribute(a)) : safeUrl(child.getAttribute(a))
        if (!ok) child.removeAttribute(a)
      }
    }
    if (tag === 'A' && child.getAttribute('target') === '_blank') child.setAttribute('rel', 'noopener')
    clean(child, allow)
  }
}

export function sanitize(html = '', mode = 'inline') {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  clean(doc.body, mode === 'block' ? BLOCK : INLINE)
  return doc.body.innerHTML.replace(/&nbsp;/g, ' ').trim()
}

export const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
