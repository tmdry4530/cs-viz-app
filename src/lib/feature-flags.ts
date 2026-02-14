import { prisma } from "@/lib/db"

export type Plan = "free" | "pro"

export type FeatureFlag =
  | "ai-coach"
  | "study-room"
  | "monthly-report"
  | "advanced-diagnostic"
  | "unlimited-sessions"

const PRO_FEATURES: Record<FeatureFlag, Plan> = {
  "ai-coach": "pro",
  "study-room": "pro",
  "monthly-report": "pro",
  "advanced-diagnostic": "pro",
  "unlimited-sessions": "pro",
}

/**
 * Get the plan for a user by looking up their subscription.
 * Returns 'free' if no user or no active subscription.
 */
export async function getPlan(userId: string | null): Promise<Plan> {
  if (!userId) return "free"

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true },
  })

  if (!subscription) return "free"
  if (subscription.status !== "active") return "free"

  // Check if subscription has expired
  if (
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd < new Date()
  ) {
    return "free"
  }

  return subscription.plan as Plan
}

/**
 * Check if a user has access to a feature.
 */
export async function hasFeature(
  userId: string | null,
  flag: FeatureFlag
): Promise<boolean> {
  const requiredPlan = PRO_FEATURES[flag]
  if (!requiredPlan) return true // unknown flag = free

  if (requiredPlan === "free") return true

  const userPlan = await getPlan(userId)
  return userPlan === "pro"
}

/**
 * Get all feature flags with their access status for a user.
 */
export async function getFeatureAccess(
  userId: string | null
): Promise<Record<FeatureFlag, boolean>> {
  const plan = await getPlan(userId)
  const access = {} as Record<FeatureFlag, boolean>

  for (const [flag, requiredPlan] of Object.entries(PRO_FEATURES)) {
    access[flag as FeatureFlag] =
      requiredPlan === "free" || plan === "pro"
  }

  return access
}

export const ALL_FEATURES = Object.keys(PRO_FEATURES) as FeatureFlag[]
