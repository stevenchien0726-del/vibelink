export function createDeadlineSignal(
  deadlineAt: number,
  maxTimeoutMs: number
) {
  const remainingMs = deadlineAt - Date.now()

  if (remainingMs <= 0) {
    return null
  }

  return AbortSignal.timeout(
    Math.max(1, Math.min(remainingMs, maxTimeoutMs))
  )
}

export function hasDeadlineTime(
  deadlineAt: number,
  minimumRemainingMs = 500
) {
  return deadlineAt - Date.now() >= minimumRemainingMs
}

export async function withRouteDeadline<T>(
  promise: PromiseLike<T>,
  deadlineAt: number
): Promise<T> {
  const remainingMs = deadlineAt - Date.now()

  if (remainingMs <= 0) {
    throw new Error('AI_RADAR_DEADLINE_EXCEEDED')
  }

  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('AI_RADAR_DEADLINE_EXCEEDED'))
        }, remainingMs)
      }),
    ])
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}
