# Acadia Care website (v2)

Rebuild of [acadiacare.co.uk](https://acadiacare.co.uk/) for Acadia Support Services Ltd.

- **Fast, crawlable HTML pages**: Home, About, Services, Careers (5-step application), Contact, Privacy, Terms, plus admin-created custom pages at `/p/<slug>`.
- **Design**: brand pink `#df3fb6`, Playfair Display + Plus Jakarta Sans, Lucide icons (inlined at build time), Motion animations (respects reduced motion).
- **Hero**: Acadia's own videos, cropped to a silent 16:9 loop (`public/assets/videos/hero-loop.mp4`); both full videos play in the "See the difference" section.
- **Emails (Resend)**: every form emails the office and sends the visitor a confirmation. Job applications attach a PDF summary + CV + documents.
- **CMS (Supabase)**: sign in at `/admin`, then edit any page in place (text, links, images, videos, hide/show sections, menu, contact settings) and click **Save**. Changes are live instantly.

## Stack

Vite (multi-page, vanilla JS) · Motion · Lucide · Supabase (Postgres, Auth, Storage) · Resend · Vercel serverless functions (`/api`) · pdf-lib.

## Local development

```bash
npm install
cp .env.example .env   # fill in the keys
npm run dev            # site + /api functions on http://localhost:5173
npm run build          # production build → dist/
```

## One-time setup

### 1. Supabase
1. Dashboard → **SQL Editor** → paste `supabase/schema.sql` → **Run**. This creates the tables, security rules (RLS), storage buckets (`media` public, `applications` private) and makes `care@acadiacare.co.uk` an admin.
2. Dashboard → **Authentication → URL Configuration**: set Site URL to `https://acadiacare.co.uk` and add `https://acadiacare.co.uk/admin` to Redirect URLs (for password reset emails).
3. The admin login is the Supabase Auth user `care@acadiacare.co.uk`. Forgot the password? Use "Forgot password?" on `/admin`.
4. More admins: create the user in Authentication → Users, then add their email to the `admins` table.

### 2. Resend
1. resend.com → **Domains** → `acadiacare.co.uk` → add the DNS records shown (SPF, DKIM, MX for `send.`) at your domain registrar, then click **Verify**.
2. Until the domain is verified, emails fall back to Resend's test sender, which can only deliver to the Resend account owner's inbox (applicant/visitor confirmations will not arrive).

### 3. Vercel environment variables
Project → Settings → Environment Variables (Production + Preview):

| Name | Value | Exposed to browser? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://<project>.supabase.co` | yes (public) |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable key | yes (public, RLS-protected) |
| `SUPABASE_URL` | same URL | no |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** key | **no, server only** |
| `RESEND_API_KEY` | Resend API key | **no, server only** |
| `RESEND_FROM` | `Acadia Care <website@acadiacare.co.uk>` | no |
| `ADMIN_EMAIL` | `care@acadiacare.co.uk` | no |
| `SITE_URL` | `https://acadiacare.co.uk` | no |
| `ALLOWED_ORIGIN` | `https://acadiacare.co.uk,https://www.acadiacare.co.uk` (optional) | no |

Redeploy after adding them (the `VITE_` values are baked in at build time).

## How the CMS works

- Each section has `data-s="<scope>"`. Editable text, images and videos inside it are keyed automatically (`home-hero:t1`, `home-about:i0`…). Saved overrides store a hash of the original content, so if a developer later edits the HTML, an old override can never land on the wrong element.
- Content lives in `site_content` (`global` = header/footer/menu/settings, `page:<name>` = page edits). Only admins can write (RLS); everyone can read.
- Visitors get the HTML defaults instantly (good for SEO) and live edits are applied on load (cached in the browser for speed).
- Elements with `data-set` / `data-link` (phone, email, WhatsApp, socials) are driven by **Site settings**.

## Application flow (security)

1. Browser uploads CV/documents straight to the **private** `applications` bucket (visitors can upload to `incoming/` but never read anything back).
2. `/api/application` validates the data, downloads the files with the server key, builds a PDF summary, saves the row, then emails care@ (PDF + CV + documents attached, reply-to = applicant) and emails the applicant a confirmation with their PDF.
3. Admins see every application under **Dashboard → Applications** and download documents via short-lived signed links.

## Project structure

```
index.html, about/, services/, careers/, contact/, privacy-policy/, terms/, page/, admin/, 404.html
partials/        shared nav, footer, logo, WhatsApp widget, contact form (injected at build)
src/css/         main.css (site), editor.css (editor + admin UI), admin.css
src/js/          main, cms, motion, forms, application, editor, admin, admin-ui, sanitize, config
api/             contact.js, application.js, _lib/ (http, resend, supabase, pdf, templates)
supabase/        schema.sql
public/assets/   images (WebP), videos, brand
```

## Before launch

- Verify `acadiacare.co.uk` in Resend (DNS).
- Run `supabase/schema.sql`.
- Replace the sample testimonials and stock photos with real ones (both editable in the admin).
- Have the Privacy Policy and Terms reviewed.
