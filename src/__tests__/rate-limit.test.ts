import { rateLimit } from "../lib/rate-limit"

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const result = rateLimit("test-allow", { limit: 3, windowSeconds: 60 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it("blocks requests exceeding the limit", () => {
    const key = "test-block-" + Date.now()
    for (let i = 0; i < 5; i++) {
      rateLimit(key, { limit: 5, windowSeconds: 60 })
    }
    const result = rateLimit(key, { limit: 5, windowSeconds: 60 })
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("decrements remaining count correctly", () => {
    const key = "test-decrement-" + Date.now()
    const r1 = rateLimit(key, { limit: 3, windowSeconds: 60 })
    expect(r1.remaining).toBe(2)
    const r2 = rateLimit(key, { limit: 3, windowSeconds: 60 })
    expect(r2.remaining).toBe(1)
    const r3 = rateLimit(key, { limit: 3, windowSeconds: 60 })
    expect(r3.remaining).toBe(0)
  })

  it("returns resetTime in the future", () => {
    const result = rateLimit("test-reset-" + Date.now(), { limit: 5, windowSeconds: 60 })
    expect(result.resetTime).toBeGreaterThan(Date.now())
  })

  it("uses separate windows per key", () => {
    const keyA = "test-sep-a-" + Date.now()
    const keyB = "test-sep-b-" + Date.now()
    const opts = { limit: 1, windowSeconds: 60 }

    rateLimit(keyA, opts)
    const blockedA = rateLimit(keyA, opts)
    expect(blockedA.success).toBe(false)

    const allowedB = rateLimit(keyB, opts)
    expect(allowedB.success).toBe(true)
  })
})
