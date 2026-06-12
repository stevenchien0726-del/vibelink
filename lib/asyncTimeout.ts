import { Capacitor } from '@capacitor/core'

export const AUTH_TIMEOUT_MS = 6_000
export const SUPABASE_TIMEOUT_MS = 8_000

export function logNativeLifecycle(
  event: string,
  details?: Record<string, unknown>
) {
  if (!Capacitor.isNativePlatform()) return

  if (details) {
    console.log(`[Capacitor iOS] ${event}`, details)
  } else {
    console.log(`[Capacitor iOS] ${event}`)
  }
}

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = SUPABASE_TIMEOUT_MS,
  label = 'request'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        logNativeLifecycle(`${label}_timeout`, { timeoutMs: ms })
        reject(new Error(`${label} timeout after ${ms}ms`))
      }, ms)
    }),
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}

export async function safeTask<T>(
  task: () => PromiseLike<T>,
  label: string,
  ms = SUPABASE_TIMEOUT_MS
): Promise<T | null> {
  try {
    return await withTimeout(task(), ms, label)
  } catch (error) {
    logNativeLifecycle(`${label}_error`, {
      message: error instanceof Error ? error.message : String(error),
    })
    console.warn(`${label} failed:`, error)
    return null
  }
}
