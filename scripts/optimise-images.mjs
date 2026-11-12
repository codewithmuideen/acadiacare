/**
 * Image pipeline for the Acadia Care website.
 *
 * Reads original photographs from /assets (client-supplied, never modified)
 * and /assets/licensed (downloaded royalty-free images, see IMAGE_CREDITS.md),
 * then writes responsive WebP renditions + brand icons into /public/assets.
 *
 * Usage: npm run images
 */
import sharp from 'sharp'
import { mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const src = (p) => path.join(root, 'assets', p)
const out = (p) => path.join(root, 'public', 'assets', p)

const WIDTHS = [480, 800, 1200, 1800]

/** name -> source file. Names are the public, meaningful filenames. */
const photos = {
  // Client photography from the existing acadiacare.co.uk site
  'carer-embrace-wheelchair': 'Header.jpg',
  'carer-conversation-living-room': 'Header-2.jpg',
  'carer-breakfast-home-visit': 'Header-3.jpg',
  'carer-embrace-mono': 'Services.jpg',
  'garden-walk-mono': 'Services-2.jpg',
  // Licensed (Unsplash License), see IMAGE_CREDITS.md
  'carer-laughing-resident': 'licensed/dMhB7w99ju8.jpg',
  'carer-shared-laugh': 'licensed/GPrh_GLiWCI.jpg',
  'carer-leaning-resident': 'licensed/qW3DLnehg9w.jpg',
  'colouring-activity': 'licensed/bSXk1lOp8T0.jpg',
  'knitting-group': 'licensed/GStFfDrOygo.jpg',
  'walker-support': 'licensed/2obyM4zYt3Y.jpg',
  'photo-album-home': 'licensed/rQJ3xo-0WYE.jpg',
  'holding-hands-mono': 'licensed/mwGrAl1X514.jpg',
  'garden-independence': 'licensed/7BXmH9YzNAI.jpg',
  'couple-independent-living': 'licensed/lNTbuoYMSro.jpg',
  'social-activity-dancing': 'licensed/96vNkptUfz0.jpg',
  'care-professional-home-visit': 'licensed/dcBO4nt4MRE.jpg',
}

async function run() {
  await mkdir(out('images'), { recursive: true })
  await mkdir(out('brand'), { recursive: true })

  const manifest = {}
  for (const [name, file] of Object.entries(photos)) {
    const input = src(file)
    if (!existsSync(input)) {
      console.warn(`! missing ${file}`)
      continue
    }
    const meta = await sharp(input).metadata()
    manifest[name] = { width: meta.width, height: meta.height }
    for (const w of WIDTHS) {
      if (w > meta.width + 200) continue
      await sharp(input)
        .resize({ width: Math.min(w, meta.width) })
        .webp({ quality: 74, effort: 5 })
        .toFile(out(`images/${name}-${w}.webp`))
    }
    console.log(`✓ ${name}`)
  }

  // Brand: logo (trimmed) + monogram icons
  await sharp(src('logo.png')).trim().resize({ width: 640 }).png({ compressionLevel: 9 }).toFile(out('brand/acadia-logo.png'))
  await sharp(src('logo.png')).trim().resize({ width: 640 }).webp({ quality: 90 }).toFile(out('brand/acadia-logo.webp'))
  // White variant for dark backgrounds
  await sharp(src('logo.png'))
    .trim()
    .resize({ width: 640 })
    .ensureAlpha()
    .linear([0, 0, 0, 1], [255, 255, 255, 0])
    .png()
    .toFile(out('brand/acadia-logo-white.png'))

  const square = (size, file, pad = 0.12, bg = { r: 0, g: 0, b: 0, alpha: 0 }) => {
    const inner = Math.round(size * (1 - pad * 2))
    return sharp(src('favicon.png'))
      .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: Math.round((size - inner) / 2), bottom: size - inner - Math.round((size - inner) / 2), left: Math.round((size - inner) / 2), right: size - inner - Math.round((size - inner) / 2), background: bg })
      .png()
      .toFile(path.join(root, 'public', file))
  }
  const cream = { r: 248, g: 245, b: 240, alpha: 1 }
  await square(32, 'favicon-32.png', 0.04)
  await square(180, 'apple-touch-icon.png', 0.14, cream)
  await square(192, 'icon-192.png', 0.14, cream)
  await square(512, 'icon-512.png', 0.14, cream)
  await copyFile(src('favicon.png'), out('brand/acadia-monogram.png'))

  // Open Graph image 1200x630
  const overlay = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#1F1A17" stop-opacity="0.92"/>
          <stop offset="0.55" stop-color="#1F1A17" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#1F1A17" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <text x="72" y="300" font-family="Georgia, serif" font-size="68" fill="#F8F5F0">Care that puts</text>
      <text x="72" y="380" font-family="Georgia, serif" font-size="68" font-style="italic" fill="#F59AD6">people first.</text>
      <text x="74" y="452" font-family="Arial, sans-serif" font-size="24" letter-spacing="3" fill="#E9E3D8">ACADIA SUPPORT SERVICES · STAFFORDSHIRE</text>
    </svg>`)
  await sharp(src('Header-2.jpg'))
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'right' })
    .composite([{ input: overlay }])
    .jpeg({ quality: 82 })
    .toFile(path.join(root, 'public', 'og-image.jpg'))

  console.log('\nDimensions:', JSON.stringify(manifest, null, 0))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
