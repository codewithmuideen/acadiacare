/**
 * Minimal Supabase REST client using the SERVICE ROLE key (server only).
 * Works with both new secret keys (sb_secret_…) and legacy service_role JWTs.
 */
const url = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const dbConfigured = () => !!(url() && key())

function headers(extra = {}) {
  const k = key()
  return { apikey: k, ...(k.startsWith('eyJ') ? { Authorization: `Bearer ${k}` } : {}), ...extra }
}

export async function insert(table, row) {
  const res = await fetch(`${url()}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`Supabase insert ${table} failed: ${res.status} ${await res.text()}`)
  const [created] = await res.json()
  return created
}

export async function download(bucket, path) {
  const res = await fetch(`${url()}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`, { headers: headers() })
  if (!res.ok) throw new Error(`Storage download failed (${res.status}) for ${path}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Move uploaded files from incoming/<tmp>/ to <applicationId>/ so they are grouped per applicant. */
export async function move(bucket, from, to) {
  const res = await fetch(`${url()}/storage/v1/object/move`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ bucketId: bucket, sourceKey: from, destinationKey: to }),
  })
  if (!res.ok) throw new Error(`Storage move failed (${res.status})`)
}

export async function update(table, match, patch) {
  const q = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&')
  const res = await fetch(`${url()}/rest/v1/${table}?${q}`, { method: 'PATCH', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(patch) })
  if (!res.ok) throw new Error(`Supabase update failed: ${res.status}`)
}
