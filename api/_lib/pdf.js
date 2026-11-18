/** Builds the "Application summary" PDF attached to the office and applicant emails. */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PINK = rgb(0.875, 0.247, 0.714)
const DARK = rgb(0.1, 0.06, 0.13)
const MUTED = rgb(0.45, 0.36, 0.48)

// Standard PDF fonts only cover WinAnsi; replace anything else safely.
const safe = (s = '') => String(s)
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...')
  .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '?')

function wrap(text, font, size, width) {
  const lines = []
  for (const para of safe(text).split(/\r?\n/)) {
    let line = ''
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(test, size) <= width) line = test
      else {
        if (line) lines.push(line)
        let w = word
        while (font.widthOfTextAtSize(w, size) > width) { // very long words
          let i = w.length
          while (i > 1 && font.widthOfTextAtSize(w.slice(0, i), size) > width) i--
          lines.push(w.slice(0, i)); w = w.slice(i)
        }
        line = w
      }
    }
    lines.push(line)
  }
  return lines
}

export async function applicationPdf({ title, subtitle, sections }) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  doc.setTitle(safe(title)); doc.setAuthor('Acadia Care website'); doc.setCreator('acadiacare.co.uk')
  const W = 595.28, H = 841.89, M = 48, CW = W - M * 2
  let page, y
  const newPage = () => {
    page = doc.addPage([W, H])
    page.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: PINK })
    page.drawText('Acadia Care', { x: M, y: H - 38, size: 18, font: bold, color: rgb(1, 1, 1) })
    page.drawText('Acadia Support Services Ltd  |  care@acadiacare.co.uk', { x: M, y: H - 56, size: 9, font, color: rgb(1, 1, 1) })
    y = H - 100
  }
  const ensure = (h) => { if (y - h < M) newPage() }
  newPage()
  page.drawText(safe(title), { x: M, y, size: 18, font: bold, color: DARK }); y -= 20
  if (subtitle) { page.drawText(safe(subtitle), { x: M, y, size: 10, font, color: MUTED }); y -= 24 }
  for (const section of sections) {
    ensure(40)
    y -= 6
    page.drawText(safe(section.heading).toUpperCase(), { x: M, y, size: 9.5, font: bold, color: PINK }); y -= 8
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: rgb(0.94, 0.87, 0.94) }); y -= 16
    for (const [label, value] of section.rows) {
      if (value === undefined || value === null || String(value).trim() === '') continue
      const lines = wrap(String(value), font, 10.5, CW - 150)
      ensure(14 * lines.length + 6)
      page.drawText(safe(label), { x: M, y, size: 9.5, font: bold, color: MUTED })
      lines.forEach((ln, i) => {
        if (i > 0 && y < M + 14) { newPage() }
        page.drawText(ln, { x: M + 150, y, size: 10.5, font, color: DARK })
        y -= 14
      })
      y -= 6
    }
  }
  return Buffer.from(await doc.save())
}
