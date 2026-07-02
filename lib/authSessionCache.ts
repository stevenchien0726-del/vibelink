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

export async function signOutCurrentUser(): Promise<void> {
  logNativeLifecycle('auth_sign_out_start')

  let result: Awaited<ReturnType<typeof supabase.auth.signOut>>

  try {
    result = await withTimeout(
      supabase.auth.signOut(),
      AUTH_TIMEOUT_MS,
      'auth_sign_out'
    )
  } catch (error) {
    clearSessionCache()

    if (
      error instanceof Error &&
      error.message.startsWith('auth_sign_out timeout')
    ) {
      // 逾時視同已登出，不阻擋登出流程；但原本的 signOut 可能卡在
      // 網路端、尚未清掉 SDK 存在 storage 的 session，這裡盡力補清，
      // 避免之後 getCachedSession 從 storage 讀回舊 session。
      void supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      return
    }

    logNativeLifecycle('auth_sign_out_error', {
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }

  clearSessionCache()

  if (result.error) {
    logNativeLifecycle('auth_sign_out_error', {
      message: result.error.message,
    })
    throw result.error
  }

  logNativeLifecycle('auth_sign_out_success')
}
