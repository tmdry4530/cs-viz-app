import { checkoutSchema, webhookSchema } from "../lib/validations"

// ─── Pure validation tests (no DB dependency) ───

describe("checkoutSchema", () => {
  it("accepts plan 'pro'", () => {
    const result = checkoutSchema.safeParse({ plan: "pro" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid plan", () => {
    const result = checkoutSchema.safeParse({ plan: "enterprise" })
    expect(result.success).toBe(false)
  })

  it("rejects missing plan", () => {
    const result = checkoutSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects empty string plan", () => {
    const result = checkoutSchema.safeParse({ plan: "" })
    expect(result.success).toBe(false)
  })
})

describe("webhookSchema", () => {
  it("accepts checkout.session.completed event", () => {
    const result = webhookSchema.safeParse({
      type: "checkout.session.completed",
      data: { userId: "user-1", plan: "pro" },
    })
    expect(result.success).toBe(true)
  })

  it("accepts customer.subscription.deleted event", () => {
    const result = webhookSchema.safeParse({
      type: "customer.subscription.deleted",
      data: { userId: "user-1" },
    })
    expect(result.success).toBe(true)
  })

  it("accepts invoice.payment_failed event", () => {
    const result = webhookSchema.safeParse({
      type: "invoice.payment_failed",
      data: { userId: "user-1" },
    })
    expect(result.success).toBe(true)
  })

  it("rejects unknown event type", () => {
    const result = webhookSchema.safeParse({
      type: "unknown.event",
      data: { userId: "user-1" },
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing userId in data", () => {
    const result = webhookSchema.safeParse({
      type: "checkout.session.completed",
      data: {},
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty userId", () => {
    const result = webhookSchema.safeParse({
      type: "checkout.session.completed",
      data: { userId: "" },
    })
    expect(result.success).toBe(false)
  })

  it("accepts optional plan and subscriptionId fields", () => {
    const result = webhookSchema.safeParse({
      type: "checkout.session.completed",
      data: {
        userId: "user-1",
        plan: "pro",
        subscriptionId: "sub_123",
      },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.plan).toBe("pro")
      expect(result.data.data.subscriptionId).toBe("sub_123")
    }
  })

  it("rejects missing data object", () => {
    const result = webhookSchema.safeParse({
      type: "checkout.session.completed",
    })
    expect(result.success).toBe(false)
  })
})

// ─── Mock Stripe logic tests (pure functions) ───

describe("mock stripe session ID generation", () => {
  it("generates unique session IDs", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const id = `mock_cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      ids.add(id)
    }
    // Allow for potential timestamp collisions but random suffix should differentiate
    expect(ids.size).toBeGreaterThanOrEqual(95)
  })

  it("session ID starts with mock_cs_ prefix", () => {
    const id = `mock_cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    expect(id).toMatch(/^mock_cs_\d+_[a-z0-9]+$/)
  })
})

describe("mock customer portal URL", () => {
  function getCustomerPortalUrl(userId: string): string {
    return `/pricing?portal=true&user=${userId}`
  }

  it("returns URL with user parameter", () => {
    const url = getCustomerPortalUrl("user-123")
    expect(url).toBe("/pricing?portal=true&user=user-123")
  })

  it("includes portal=true parameter", () => {
    const url = getCustomerPortalUrl("test")
    expect(url).toContain("portal=true")
  })
})
