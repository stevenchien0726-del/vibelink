import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

let cachedSession: Session | null | undefined = undefined
let pendingSessionPromise: Promise<Session | null> | null = null

const SESSION_TIMEOUT_MS = 5000

export async function getCachedSession(
  forceRefresh = false
): Promise<Session | null> {
  if (!forceRefresh && cachedSession !== undefined) {
    return cachedSession
  }

  if (!forceRefresh && pendingSessionPromise) {
    return pendingSessionPromise
  }

  pendingSessionPromise = new Promise<Session | null>((resolve) => {
    let settled = false

    const timeoutId = setTimeout(() => {
      if (settled) return

      settled = true
      console.warn('auth_get_session timeout')

      if (cachedSession === undefined) {
        cachedSession = null
      }

      resolve(cachedSession)
    }, SESSION_TIMEOUT_MS)

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (settled) {
          if (!error) {
            cachedSession = data.session ?? null
          }
          return
        }

        settled = true
        clearTimeout(timeoutId)

        if (error) {
          console.warn('auth_get_session_error', error)

          if (cachedSession === undefined) {
            cachedSession = null
          }

          resolve(cachedSession)
          return
        }

        cachedSession = data.session ?? null
        resolve(cachedSession)
      })
      .catch((error) => {
        if (settled) return

        settled = true
        clearTimeout(timeoutId)

        console.warn('auth_get_session_error', error)

        if (cachedSession === undefined) {
          cachedSession = null
        }

        resolve(cachedSession)
      })
      .finally(() => {
        pendingSessionPromise = null
      })
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
