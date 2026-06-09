import { supabase } from '@/lib/supabase'

type EnsuredUserProfile = {
  id: string
  username: string
  display_name: string
} | null

let ensureUserProfilePromise: Promise<EnsuredUserProfile> | null = null
let lastEnsureUserProfileAt = 0

const ENSURE_PROFILE_CACHE_MS = 30_000
const ENSURE_PROFILE_TIMEOUT_MS = 8_000

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
    const result = await ensureUserProfilePromise
    lastEnsureUserProfileAt = Date.now()
    return result
  } catch (error) {
    console.warn('ensureUserProfile failed:', error)
    return null
  }
}

async function runEnsureUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await withAbortTimeout(() => supabase.auth.getUser(), 6_000)

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
