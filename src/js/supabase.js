/** Lazily created Supabase client (only loaded by the editor, admin and file uploads). */
import { SUPABASE_URL, SUPABASE_KEY, CMS_ENABLED } from './config.js'

let client = null
export async function getClient() {
  if (!CMS_ENABLED) throw new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
  if (client) return client
  const { createClient } = await import('@supabase/supabase-js')
  client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  return client
}

export async function isAdmin(sb) {
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return false
  const { data, error } = await sb.rpc('is_admin')
  if (error) { console.warn('[admin] is_admin failed', error); return false }
  return data === true
}

export const hasStoredSession = () => {
  try { return Object.keys(localStorage).some((k) => /^sb-.*-auth-token$/.test(k)) } catch { return false }
}

export function safeFileName(name = 'file') {
  const dot = name.lastIndexOf('.')
  const ext = dot > -1 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '') : ''
  const base = (dot > -1 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file'
  return base + ext
}

export const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`)
