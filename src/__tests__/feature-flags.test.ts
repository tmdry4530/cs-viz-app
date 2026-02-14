import type { Plan, FeatureFlag } from "../lib/feature-flags"

// ─── Pure logic extracted for unit testing (no DB dependency) ───

const PRO_FEATURES: Record<FeatureFlag, Plan> = {
  "ai-coach": "pro",
  "study-room": "pro",
  "monthly-report": "pro",
  "advanced-diagnostic": "pro",
  "unlimited-sessions": "pro",
}

function checkFeatureAccess(userPlan: Plan, flag: FeatureFlag): boolean {
  const requiredPlan = PRO_FEATURES[flag]
  if (!requiredPlan) return true
  if (requiredPlan === "free") return true
  return userPlan === "pro"
}

function determinePlan(
  subscription: {
    plan: string
    status: string
    currentPeriodEnd: Date | null
  } | null,
  now: Date = new Date()
): Plan {
  if (!subscription) return "free"
  if (subscription.status !== "active") return "free"
  if (
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd < now
  ) {
    return "free"
  }
  return subscription.plan as Plan
}

function getAllFeatureAccess(
  userPlan: Plan
): Record<FeatureFlag, boolean> {
  const access = {} as Record<FeatureFlag, boolean>
  for (const [flag, requiredPlan] of Object.entries(PRO_FEATURES)) {
    access[flag as FeatureFlag] =
      requiredPlan === "free" || userPlan === "pro"
  }
  return access
}

// ─── Tests ──────────────────────────────────────────────────

describe("determinePlan", () => {
  it("returns 'free' when no subscription exists", () => {
    expect(determinePlan(null)).toBe("free")
  })

  it("returns 'free' when subscription status is canceled", () => {
    expect(
      determinePlan({
        plan: "pro",
        status: "canceled",
        currentPeriodEnd: new Date("2030-01-01"),
      })
    ).toBe("free")
  })

  it("returns 'free' when subscription status is past_due", () => {
    expect(
      determinePlan({
        plan: "pro",
        status: "past_due",
        currentPeriodEnd: new Date("2030-01-01"),
      })
    ).toBe("free")
  })

  it("returns 'pro' when subscription is active and not expired", () => {
    expect(
      determinePlan({
        plan: "pro",
        status: "active",
        currentPeriodEnd: new Date("2030-01-01"),
      })
    ).toBe("pro")
  })

  it("returns 'free' when subscription period has expired", () => {
    expect(
      determinePlan(
        {
          plan: "pro",
          status: "active",
          currentPeriodEnd: new Date("2020-01-01"),
        },
        new Date("2025-01-01")
      )
    ).toBe("free")
  })

  it("returns 'pro' when currentPeriodEnd is null (no expiry)", () => {
    expect(
      determinePlan({
        plan: "pro",
        status: "active",
        currentPeriodEnd: null,
      })
    ).toBe("pro")
  })

  it("returns 'free' for a free plan subscription", () => {
    expect(
      determinePlan({
        plan: "free",
        status: "active",
        currentPeriodEnd: null,
      })
    ).toBe("free")
  })
})

describe("checkFeatureAccess", () => {
  const proFeatures: FeatureFlag[] = [
    "ai-coach",
    "study-room",
    "monthly-report",
    "advanced-diagnostic",
    "unlimited-sessions",
  ]

  it("denies all pro features for free users", () => {
    for (const flag of proFeatures) {
      expect(checkFeatureAccess("free", flag)).toBe(false)
    }
  })

  it("grants all pro features for pro users", () => {
    for (const flag of proFeatures) {
      expect(checkFeatureAccess("pro", flag)).toBe(true)
    }
  })
})

describe("getAllFeatureAccess", () => {
  it("returns all false for free plan", () => {
    const access = getAllFeatureAccess("free")
    expect(access["ai-coach"]).toBe(false)
    expect(access["study-room"]).toBe(false)
    expect(access["monthly-report"]).toBe(false)
    expect(access["advanced-diagnostic"]).toBe(false)
    expect(access["unlimited-sessions"]).toBe(false)
  })

  it("returns all true for pro plan", () => {
    const access = getAllFeatureAccess("pro")
    expect(access["ai-coach"]).toBe(true)
    expect(access["study-room"]).toBe(true)
    expect(access["monthly-report"]).toBe(true)
    expect(access["advanced-diagnostic"]).toBe(true)
    expect(access["unlimited-sessions"]).toBe(true)
  })

  it("returns entries for all 5 feature flags", () => {
    const access = getAllFeatureAccess("free")
    expect(Object.keys(access)).toHaveLength(5)
  })
})
