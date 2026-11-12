/**
 * POST /api/application: DELIBERATELY NOT IMPLEMENTED.
 *
 * Staff applications include special-category health data (UK GDPR Art. 9)
 * and criminal-offence data (Art. 10). They must not be emailed via Resend or
 * stored without encryption, access control, audit logging and a retention
 * policy. This stub exists so the route can never be mistaken for a working
 * endpoint. See docs/SECURE-APPLICATION-SUBMISSION.md for the required design.
 */
export default function handler(req, res) {
  res.statusCode = 501
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(
    JSON.stringify({
      ok: false,
      code: 'not-configured',
      error: 'Online applications are not open yet. Please contact our team by phone or email.',
    }),
  )
}
