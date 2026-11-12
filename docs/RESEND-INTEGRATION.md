# Connecting the contact forms to Resend

The contact form and recruitment enquiry form are fully built. They post JSON to two
serverless functions in `/api`, which send email through the Resend REST API.
Until the environment variables below are set, the functions return `501` and the
form tells the visitor, honestly, that online messages are not connected yet and
shows the phone number and email address. Nothing pretends to succeed.

## Endpoints

| Route | Used by | Inbox |
| --- | --- | --- |
| `POST /api/contact` | Contact form (all subjects except recruitment) | `CONTACT_TO` |
| `POST /api/enquiry` | Contact form when subject is "Recruitment / working with us" | `RECRUITMENT_TO` (falls back to `CONTACT_TO`) |
| `POST /api/application` | Nothing. Deliberately returns 501. | See SECURE-APPLICATION-SUBMISSION.md |

Each endpoint validates input with Zod on the server, ignores honeypot spam, escapes
HTML in the email body, sets `reply_to` to the visitor's email and never echoes
provider errors to the browser.

## Setup (Vercel)

1. Create a Resend account and **verify the sending domain** `acadiacare.co.uk`
   (Resend > Domains, then add the DNS records it gives you).
2. Create an API key with "Sending access" only.
3. In Vercel > Project > Settings > Environment Variables, add (Production and Preview):

   | Variable | Example |
   | --- | --- |
   | `RESEND_API_KEY` | `re_...` |
   | `RESEND_FROM` | `Acadia Care Website <website@acadiacare.co.uk>` |
   | `CONTACT_TO` | `care@acadiacare.co.uk` |
   | `RECRUITMENT_TO` | `care@acadiacare.co.uk` |
   | `ALLOWED_ORIGIN` | `https://acadiacare.co.uk` |

4. Redeploy. Submit the contact form on the live site and confirm the email arrives.

**Never** prefix these with `VITE_`. Anything starting with `VITE_` is bundled into the
public JavaScript.

## Before going live (recommended)

- Add rate limiting per IP (e.g. Upstash Ratelimit) where the `TODO(rate-limit)` comment is in `api/_lib/mail.js`.
- Optionally add Cloudflare Turnstile to the form for stronger spam protection.
- Update the privacy policy to mention Resend as an email processor.

## Local testing

`npm run dev` does not run the `/api` functions, so the form will show the
"not connected" message. Use `vercel dev` (Vercel CLI) with a local `.env` to test the
full flow.
