import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

let cachedSession: Session | null | undefined = undefined
let pendingSessionPromise: Promise<Session | null> | null = null

const SESSION_TIMEOUT_MS = 5000

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer =
      typeof window !== 'undefined'
        ? window.setTimeout(() => {
            reject(new Error(`${label} timeout`))
          }, ms)
        : setTimeout(() => {
            reject(new Error(`${label} timeout`))
          }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

export async function getCachedSession(
  forceRefresh = false
): Promise<Session | null> {
  if (!forceRefresh && cachedSession !== undefined) {
    return cachedSession
  }

  if (!forceRefresh && pendingSessionPromise) {
    return pendingSessionPromise
  }

  pendingSessionPromise = withTimeout(
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error

      cachedSession = data.session ?? null
      return cachedSession
    }),
    SESSION_TIMEOUT_MS,
    'auth_get_session'
  ).finally(() => {
    pendingSessionPromise = null
  })

  return pendingSessionPromise
}

export function setCachedSession(session: Session | null): void {
  cachedSession = session
}

export function clearCachedSession(): void {
  cachedSession = null
}

export function subscribeAuthSession() {
  return supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session ?? null
  })
}

export async function signOutCurrentUser(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  clearCachedSession()
}
