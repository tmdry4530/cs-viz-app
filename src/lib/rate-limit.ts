interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now >= entry.resetTime) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  /** Max number of requests in the window */
  limit: number
  /** Window size in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

export function rateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || now >= entry.resetTime) {
    // New window
    const resetTime = now + windowMs
    store.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetTime,
    }
  }

  if (entry.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

// Preset rate limiters
export const rateLimiters = {
  login: (ip: string) =>
    rateLimit(`login:${ip}`, { limit: 5, windowSeconds: 60 }),
  comment: (userId: string) =>
    rateLimit(`comment:${userId}`, { limit: 10, windowSeconds: 60 }),
  report: (userId: string) =>
    rateLimit(`report:${userId}`, { limit: 3, windowSeconds: 300 }),
  share: (userId: string) =>
    rateLimit(`share:${userId}`, { limit: 10, windowSeconds: 60 }),
  api: (ip: string) =>
    rateLimit(`api:${ip}`, { limit: 60, windowSeconds: 60 }),
}
