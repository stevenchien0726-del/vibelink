import { supabase } from '@/lib/supabase'
import {
  AUTH_TIMEOUT_MS,
  SUPABASE_TIMEOUT_MS,
  logNativeLifecycle,
} from '@/lib/asyncTimeout'

type EnsuredUserProfile = {
  id: string
  username: string
  display_name: string
} | null

let ensureUserProfilePromise: Promise<EnsuredUserProfile> | null = null
let lastEnsureUserProfileAt = 0

const ENSURE_PROFILE_CACHE_MS = 30_000
const ENSURE_PROFILE_TIMEOUT_MS = SUPABASE_TIMEOUT_MS

function withAbortTimeout<T>(
  task: (signal: AbortSignal) => PromiseLike<T>,
  timeoutMs = ENSURE_PROFILE_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController()

  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      controller.abort()
      reject(new Error(`ensureUserProfile timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    Promise.resolve(task(controller.signal))
      .then(resolve)
      .catch(reject)
      .finally(() => {
        window.clearTimeout(timeoutId)
      })
  })
}

export async function ensureUserProfile() {
  const now = Date.now()

  if (ensureUserProfilePromise) {
    return ensureUserProfilePromise
  }

  if (now - lastEnsureUserProfileAt < ENSURE_PROFILE_CACHE_MS) {
    return null
  }

  ensureUserProfilePromise = runEnsureUserProfile().finally(() => {
    ensureUserProfilePromise = null
  })

  try {
    logNativeLifecycle('ensure_profile_start')
    const result = await ensureUserProfilePromise
    lastEnsureUserProfileAt = Date.now()
    logNativeLifecycle('ensure_profile_success', {
      hasProfile: Boolean(result),
    })
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logNativeLifecycle(
      message.includes('timeout')
        ? 'ensure_profile_timeout'
        : 'ensure_profile_error',
      { message }
    )
    console.warn('ensureUserProfile failed:', error)
    return null
  }
}

async function runEnsureUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await withAbortTimeout(
    () => supabase.auth.getUser(),
    AUTH_TIMEOUT_MS
  )

  if (userError || !user) {
    return null
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Vibelink User'

  const username = `user_${user.id.slice(0, 5)}`

  const { error } = await withAbortTimeout((signal) =>
    supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          username,
          display_name: displayName,
        },
        {
          onConflict: 'id',
        }
      )
      .abortSignal(signal)
      .select('id')
      .maybeSingle()
  )

  if (error) {
    console.error('ensureUserProfile error:', error)
    return null
  }

  return {
    id: user.id,
    username,
    display_name: displayName,
  }
}
