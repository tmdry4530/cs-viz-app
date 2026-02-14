import { rateLimit } from "./rate-limit"

interface SpamCheckMetadata {
  userId?: string
  recentPostCount?: number
}

interface SpamResult {
  spam: boolean
  reason: string
  confidence: number
}

const BANNED_PATTERNS = [
  /\b(buy now|click here|free money|earn \$|make money fast)\b/i,
  /\b(viagra|cialis|casino|lottery|winner)\b/i,
  /\b(subscribe now|limited offer|act now|don't miss)\b/i,
  /\b(100% free|no cost|risk free|guaranteed)\b/i,
  /\b(crypto airdrop|nft drop|investment opportunity)\b/i,
]

/**
 * Count URLs in content (http/https links)
 */
function countUrls(content: string): number {
  const urlPattern = /https?:\/\/[^\s]+/gi
  const matches = content.match(urlPattern)
  return matches ? matches.length : 0
}

/**
 * Check for repeated consecutive characters (e.g., "aaaaaa")
 */
function hasRepeatedChars(content: string, threshold = 5): boolean {
  const pattern = new RegExp(`(.)\\1{${threshold - 1},}`)
  return pattern.test(content)
}

/**
 * Check content against banned spam patterns
 */
function matchesBannedPattern(content: string): string | null {
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(content)) {
      return pattern.source
    }
  }
  return null
}

/**
 * Check for rapid posting (3+ posts in 1 minute)
 */
function isRapidPosting(userId?: string, recentPostCount?: number): boolean {
  if (!userId) return false

  // If recentPostCount is provided, use it directly
  if (recentPostCount !== undefined) {
    return recentPostCount >= 3
  }

  // Use rate limiter: 3 posts per 60 seconds
  const result = rateLimit(`spam:post:${userId}`, {
    limit: 3,
    windowSeconds: 60,
  })

  return !result.success
}

/**
 * Detect spam in content.
 */
export function isSpam(
  content: string,
  metadata?: SpamCheckMetadata
): SpamResult {
  // Rule 1: Too many URLs (3+)
  const urlCount = countUrls(content)
  if (urlCount >= 3) {
    return {
      spam: true,
      reason: `URL이 너무 많습니다 (${urlCount}개 감지)`,
      confidence: 0.9,
    }
  }

  // Rule 2: Repeated characters (5+ consecutive)
  if (hasRepeatedChars(content)) {
    return {
      spam: true,
      reason: "반복 문자가 감지되었습니다",
      confidence: 0.7,
    }
  }

  // Rule 3: Banned patterns
  const bannedMatch = matchesBannedPattern(content)
  if (bannedMatch) {
    return {
      spam: true,
      reason: "스팸 패턴이 감지되었습니다",
      confidence: 0.85,
    }
  }

  // Rule 4: Rapid posting
  if (isRapidPosting(metadata?.userId, metadata?.recentPostCount)) {
    return {
      spam: true,
      reason: "너무 빠르게 게시하고 있습니다",
      confidence: 0.8,
    }
  }

  return {
    spam: false,
    reason: "",
    confidence: 0,
  }
}
