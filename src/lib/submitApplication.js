import { postJSON, SubmissionError } from './api'

/**
 * Submits a staff application to the SECURE application backend.
 *
 * ⚠️  The application contains special-category health data and criminal
 * offence information (UK GDPR Articles 9 & 10). It must NOT be sent by plain
 * email (e.g. a Resend notification), stored in browser storage, or posted to
 * an unprotected endpoint.
 *
 * TODO(secure-backend): implement the endpoint described in
 * docs/SECURE-APPLICATION-SUBMISSION.md, then set
 * VITE_SECURE_APPLICATION_ENDPOINT to its HTTPS URL at build time.
 *
 * Until then this function refuses to submit and the UI tells the applicant
 * how to apply by phone or email instead. It never pretends to succeed.
 */
export async function submitApplication(values) {
  const endpoint = import.meta.env.VITE_SECURE_APPLICATION_ENDPOINT
  if (!endpoint) {
    throw new SubmissionError('Online applications are not open yet.', { code: 'not-configured' })
  }
  if (!endpoint.startsWith('https://') && !import.meta.env.DEV) {
    throw new SubmissionError('The application service is misconfigured (HTTPS is required).', { code: 'insecure' })
  }

  const payload = { ...values, submittedAt: new Date().toISOString(), schemaVersion: 1 }
  return postJSON(endpoint, payload, { timeout: 30000 })
}

export const applicationsOpen = Boolean(import.meta.env.VITE_SECURE_APPLICATION_ENDPOINT)
