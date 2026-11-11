/**
 * Small JSON POST helper used by forms. It never fakes success: anything other
 * than a 2xx response with { ok: true } is surfaced to the user as an error.
 */
export class SubmissionError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function postJSON(url, data, { timeout = 15000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
      credentials: 'same-origin',
    })
  } catch (err) {
    throw new SubmissionError(
      err.name === 'AbortError'
        ? 'The request took too long. Please check your connection and try again.'
        : 'We couldn’t reach our server. Please check your connection and try again.',
      { code: 'network' },
    )
  } finally {
    clearTimeout(timer)
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    /* non-JSON response (e.g. 404 page during local development) */
  }

  if (!res.ok || !body?.ok) {
    const fallback =
      res.status === 404 || res.status === 501
        ? 'Online messages aren’t connected yet. Please call or email us directly.'
        : 'Something went wrong sending your message. Please try again or contact us directly.'
    throw new SubmissionError(body?.error || fallback, { status: res.status, code: body?.code })
  }
  return body
}
