import { supabase } from '@/lib/supabase'

type GetSessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>
type CachedSession = GetSessionResult['data']['session']

const SESSION_CACHE_TTL_MS = 30_000

let cachedSession: CachedSession = null
let cachedAt = 0

export async function getCachedSession(): Promise<CachedSession> {
  const now = Date.now()

  if (cachedAt > 0 && now - cachedAt < SESSION_CACHE_TTL_MS) {
    return cachedSession
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  cachedSession = data.session
  cachedAt = now

  return cachedSession
}

export function clearSessionCache() {
  cachedSession = null
  cachedAt = 0
}
