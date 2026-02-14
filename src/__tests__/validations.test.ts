import {
  loginSchema,
  commentSchema,
  reportSchema,
  reflectionSchema,
  quizAttemptSchema,
  applyAttemptSchema,
  reactionSchema,
} from "../lib/validations"

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "test1234" })
    expect(result.success).toBe(true)
  })
  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "test1234" })
    expect(result.success).toBe(false)
  })
  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "123" })
    expect(result.success).toBe(false)
  })
})

describe("commentSchema", () => {
  it("accepts valid comment", () => {
    const result = commentSchema.safeParse({ content: "Great post!", postId: "abc123" })
    expect(result.success).toBe(true)
  })
  it("rejects empty content", () => {
    const result = commentSchema.safeParse({ content: "", postId: "abc123" })
    expect(result.success).toBe(false)
  })
  it("rejects content over 1000 chars", () => {
    const result = commentSchema.safeParse({ content: "a".repeat(1001), postId: "abc123" })
    expect(result.success).toBe(false)
  })
})

describe("reportSchema", () => {
  it("accepts valid report", () => {
    const result = reportSchema.safeParse({ targetType: "post", targetId: "123", reason: "spam" })
    expect(result.success).toBe(true)
  })
  it("rejects invalid reason", () => {
    const result = reportSchema.safeParse({ targetType: "post", targetId: "123", reason: "invalid" })
    expect(result.success).toBe(false)
  })
})

describe("reflectionSchema", () => {
  it("accepts valid reflection", () => {
    const result = reflectionSchema.safeParse({
      sessionRunId: "s1", sentence1: "First.", sentence2: "Second.", sentence3: "Third.", isPublic: false,
    })
    expect(result.success).toBe(true)
  })
  it("rejects empty sentences", () => {
    const result = reflectionSchema.safeParse({ sessionRunId: "s1", sentence1: "", sentence2: "OK", sentence3: "OK" })
    expect(result.success).toBe(false)
  })
})

describe("quizAttemptSchema", () => {
  it("accepts valid attempt", () => {
    const result = quizAttemptSchema.safeParse({ questionId: "q1", sessionRunId: "s1", selectedAnswer: 2 })
    expect(result.success).toBe(true)
  })
  it("rejects negative answer", () => {
    const result = quizAttemptSchema.safeParse({ questionId: "q1", sessionRunId: "s1", selectedAnswer: -1 })
    expect(result.success).toBe(false)
  })
})

describe("applyAttemptSchema", () => {
  it("accepts valid attempt", () => {
    const result = applyAttemptSchema.safeParse({ sessionRunId: "s1", answer: "My answer" })
    expect(result.success).toBe(true)
  })
  it("rejects empty answer", () => {
    const result = applyAttemptSchema.safeParse({ sessionRunId: "s1", answer: "" })
    expect(result.success).toBe(false)
  })
})

describe("reactionSchema", () => {
  it("accepts valid reaction", () => {
    const result = reactionSchema.safeParse({ targetType: "post", targetId: "123", type: "like" })
    expect(result.success).toBe(true)
  })
  it("rejects invalid type", () => {
    const result = reactionSchema.safeParse({ targetType: "post", targetId: "123", type: "dislike" })
    expect(result.success).toBe(false)
  })
})
