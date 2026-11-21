import { defineConfig, loadEnv } from 'vite'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const iconDir = resolve(root, 'node_modules/lucide-static/icons')

/**
 * Build-time HTML helpers so every page stays plain, crawlable HTML:
 *  <!-- @include nav -->                → contents of partials/nav.html
 *  <i data-lucide="heart" class="x"></i> → inline Lucide SVG (no runtime JS)
 */
function inlineIcons(html) {
  return html.replace(/<i\s+data-lucide="([a-z0-9-]+)"([^>]*)><\/i>/g, (m, name, rest) => {
    const file = resolve(iconDir, `${name}.svg`)
    if (!existsSync(file)) throw new Error(`Unknown Lucide icon: ${name}`)
    const cls = (rest.match(/class="([^"]*)"/) || [])[1] || ''
    return readFileSync(file, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s*class="[^"]*"/, '')
      .replace('<svg', `<svg class="ic ${cls}" aria-hidden="true" focusable="false"`)
      .replace(/\s+(width|height)="24"/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*\/>/g, '/>')
      .trim()
  })
}

function includePartials(html, depth = 0) {
  if (depth > 5) return html
  return html.replace(/<!--\s*@include\s+([a-z0-9-]+)\s*-->/g, (m, name) =>
    includePartials(readFileSync(resolve(root, `partials/${name}.html`), 'utf8'), depth + 1),
  )
}

const htmlKit = () => ({
  name: 'acadia-html-kit',
  transformIndexHtml: { order: 'pre', handler: (html) => inlineIcons(includePartials(html)) },
  handleHotUpdate({ file, server }) {
    if (file.includes('partials')) server.ws.send({ type: 'full-reload' })
  },
  /** Local dev: run /api/*.js (Vercel functions) and clean URLs inside the Vite server. */
  configureServer(server) {
    Object.assign(process.env, loadEnv(server.config.mode, root, ''))
    server.middlewares.use(async (req, res, next) => {
      const path = req.url.split('?')[0]
      const api = path.match(/^\/api\/([a-z-]+)$/)
      if (api) {
        const file = resolve(root, `api/${api[1]}.js`)
        if (!existsSync(file)) return next()
        res.status = (c) => { res.statusCode = c; return res }
        try {
          const mod = await server.ssrLoadModule(file)
          return mod.default(req, res)
        } catch (err) {
          console.error(err)
          res.statusCode = 500
          return res.end(JSON.stringify({ ok: false, error: err.message }))
        }
      }
      if (/^\/p\/[a-z0-9-]+\/?$/.test(path)) req.url = '/page/index.html'
      else if (/^\/[a-z0-9-]+$/.test(path) && existsSync(resolve(root, `${path.slice(1)}/index.html`))) req.url = `${path}/`
      next()
    })
  },
})

const pages = ['index', 'about/index', 'services/index', 'family-share/index', 'careers/index', 'contact/index',
  'privacy-policy/index', 'terms/index', 'page/index', 'admin/index', '404']

export default defineConfig({
  plugins: [htmlKit()],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.replace('/index', '') || 'index', resolve(root, `${p}.html`)])),
    },
  },
})
