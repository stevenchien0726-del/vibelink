type RateLimitRule = {
  name: string
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult =
  | {
      allowed: true
    }
  | {
      allowed: false
      retryAfterSeconds: number
      rule: string
    }

const rateLimitStore = new Map<string, RateLimitEntry>()
let rateLimitChecks = 0

export function getRequestIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function checkRateLimits(
  key: string,
  rules: RateLimitRule[]
): RateLimitResult {
  const now = Date.now()

  rateLimitChecks += 1

  if (rateLimitChecks % 500 === 0) {
    for (const [storeKey, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(storeKey)
      }
    }
  }

  for (const rule of rules) {
    const storeKey = `${rule.name}:${key}`
    const current = rateLimitStore.get(storeKey)

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(storeKey, {
        count: 1,
        resetAt: now + rule.windowMs,
      })
      continue
    }

    if (current.count >= rule.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((current.resetAt - now) / 1000)
        ),
        rule: rule.name,
      }
    }

    current.count += 1
  }

  return {
    allowed: true,
  }
}

export type { RateLimitRule }
