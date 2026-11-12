# Acadia Care website

Rebuild of [acadiacare.co.uk](https://acadiacare.co.uk/) for Acadia Support Services Ltd.
React 19, Vite 6, Tailwind CSS 3, React Router, Motion, GSAP, Lenis, React Three Fiber,
ShaderGradient and liquid-glass-react.

## Scripts

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to /dist
npm run preview   # serve the production build
npm run images    # regenerate WebP renditions + icons from /assets
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about-acadia-care` | About |
| `/services` | Services (anchors: `#residential-care-support`, `#domiciliary-care`, `#staffing-queries`) |
| `/application` | Careers + 8-step application wizard |
| `/contact-acadia-care` | Contact (supports `?subject=staffing|residential|domiciliary|recruitment`) |
| `/privacy-policy`, `/terms-and-conditions` | Legal (original wording preserved) |
| anything else | Custom 404 |

## Structure

```
src/
  components/
    common/   Button, Img (responsive WebP), Glass (liquid glass), Seo, Reveal, SplitText, Faq...
    layout/   Navbar, MobileMenu, Footer, MobileCTA, PageTransition, Layout
    home/     Hero, Introduction, AboutPreview, ServicesOverview, WhyChooseUs,
              CareApproach, ScrollWorld, StaffingCTA, CareersCTA, ContactSection
    three/    HeroCanvas (R3F shader transitions), HeroGradient (ShaderGradient),
              ScrollWorldCanvas (scroll-driven 3D corridor), shaders.js
    forms/    ContactForm, Field components, ApplicationWizard + steps/
  data/       site.js (all copy), application.js (form questions), images.js
  lib/        schemas, API helper, application schema + submission guard
api/          Serverless functions (Resend email for non-sensitive enquiries)
docs/         RESEND-INTEGRATION.md, SECURE-APPLICATION-SUBMISSION.md
```

## Design system

Brand colours come from the existing identity and are defined as CSS variables in
`src/styles/index.css`: logo magenta `#ED38B3`, an accessible deeper magenta `#B01F80`
for text and buttons (AA contrast), the original site rose `#EA5478`, and the monogram's
steel blue `#4682B4`, on warm neutrals. Typography: Cormorant Garamond + Manrope.

## Motion and 3D

- **Hero**: five photos on a WebGL plane. Each change is a noise-shaped liquid wavefront
  (chromatic edge, brand-tinted glow) blooming from the click point or a varied spot.
  Includes cursor lens, swipe, liquid-glass caption + navigator, pause control, progress ring.
  The first photo is a regular `<img>` for fast LCP; WebGL mounts after idle.
- **ShaderGradient** backdrop behind the hero (uses scene lights, no external HDR downloads).
- **Scroll world**: sticky R3F canvas; native scroll moves the camera through ten photos
  that shift from monochrome to colour. No scroll hijacking.
- **Reduced motion** users get a calm crossfade hero and a static gallery, no WebGL.
- `three` is pinned to 0.169.0 because ShaderGradient's shaders require it.

## Before launch: action list for the client

1. **Resend**: set the environment variables in `docs/RESEND-INTEGRATION.md`.
2. **Applications**: build the secure backend in `docs/SECURE-APPLICATION-SUBMISSION.md`.
   Until then the form clearly says applications are not sent and offers phone/email.
3. **Privacy policy**: the original wording (preserved) references the Data Protection Act 1998.
   Have it updated for UK GDPR / DPA 2018, Resend, and recruitment data.
4. **Stafford address**: not published on the old site, so it is not shown. Add it to
   `src/data/site.js` if it should appear (it would also enable LocalBusiness schema).
5. **Images**: see `IMAGE_CREDITS.md`; replace stock with Acadia's own photography over time.

## Deployment

Vercel: framework preset Vite, build `npm run build`, output `dist`. `vercel.json` handles
SPA rewrites, cache headers and security headers. The `/api` functions deploy automatically.
