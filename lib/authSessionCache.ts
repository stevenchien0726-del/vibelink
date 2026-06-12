import { supabase } from '@/lib/supabase'
import {
  AUTH_TIMEOUT_MS,
  logNativeLifecycle,
  withTimeout,
} from '@/lib/asyncTimeout'

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

  logNativeLifecycle('auth_session_start')

  const { data, error } = await withTimeout(
    supabase.auth.getSession(),
    AUTH_TIMEOUT_MS,
    'auth_session'
  )

  if (error) {
    logNativeLifecycle('auth_session_error', { message: error.message })
    throw error
  }

  cachedSession = data.session
  cachedAt = now

  logNativeLifecycle('auth_session_success', {
    hasSession: Boolean(cachedSession),
  })

  return cachedSession
}

export function clearSessionCache() {
  cachedSession = null
  cachedAt = 0
}
