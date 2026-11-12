/**
 * POST /api/contact: general and service enquiries (non-sensitive).
 * Requires: RESEND_API_KEY, RESEND_FROM, CONTACT_TO (see .env.example)
 */
import { handleEnquiry } from './_lib/mail.js'

export default function handler(req, res) {
  return handleEnquiry(req, res, { to: process.env.CONTACT_TO, label: 'Website enquiry' })
}
