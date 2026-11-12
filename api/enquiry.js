/**
 * POST /api/enquiry: NON-SENSITIVE recruitment enquiries
 * ("I'd like to know more about working with you").
 *
 * This is NOT the staff application endpoint. Full applications contain
 * special-category health data and criminal-offence data and must use the
 * secure process in docs/SECURE-APPLICATION-SUBMISSION.md.
 *
 * Requires: RESEND_API_KEY, RESEND_FROM, RECRUITMENT_TO (falls back to CONTACT_TO)
 */
import { handleEnquiry } from './_lib/mail.js'

export default function handler(req, res) {
  return handleEnquiry(req, res, {
    to: process.env.RECRUITMENT_TO || process.env.CONTACT_TO,
    label: 'Recruitment enquiry',
  })
}
