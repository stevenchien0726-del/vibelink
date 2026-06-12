'use client'

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = 8000,
  label = 'request'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
        reject(new Error(`${label} timeout`))
    }, ms)

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        window.clearTimeout(timeoutId)
      })
  })
}

export async function safeTask<T>(
  task: () => PromiseLike<T>,
  label: string
): Promise<T | null> {
  try {
    return await withTimeout(task(), 8000, label)
  } catch (error) {
    console.warn(`${label} failed:`, error)
    return null
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
