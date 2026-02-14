import { diagnosticSubmitSchema } from "../lib/validations"

// ─── Scoring Logic (pure functions extracted for testing) ───

function calculateCategoryScores(
  gradedAnswers: Array<{ questionId: string; correct: boolean }>,
  questionCategories: Map<string, string>
): Map<string, { correct: number; total: number; score: number }> {
  const categoryScores = new Map<
    string,
    { correct: number; total: number; score: number }
  >()

  for (const answer of gradedAnswers) {
    const category = questionCategories.get(answer.questionId)
    if (!category) continue
    const existing = categoryScores.get(category) || {
      correct: 0,
      total: 0,
      score: 0,
    }
    existing.total++
    if (answer.correct) existing.correct++
    existing.score = existing.total > 0 ? existing.correct / existing.total : 0
    categoryScores.set(category, existing)
  }

  return categoryScores
}

function calculateOverallScore(
  gradedAnswers: Array<{ correct: boolean }>
): number {
  if (gradedAnswers.length === 0) return 0
  const correct = gradedAnswers.filter((a) => a.correct).length
  return correct / gradedAnswers.length
}

function gradeAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer === correctAnswer
}

// ─── Tests ──────────────────────────────────────────────────

describe("diagnosticSubmitSchema", () => {
  it("accepts valid submission", () => {
    const result = diagnosticSubmitSchema.safeParse({
      attemptId: "attempt-1",
      answers: [
        { questionId: "q1", answer: "1" },
        { questionId: "q2", answer: "0" },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty attemptId", () => {
    const result = diagnosticSubmitSchema.safeParse({
      attemptId: "",
      answers: [{ questionId: "q1", answer: "1" }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty answers array", () => {
    const result = diagnosticSubmitSchema.safeParse({
      attemptId: "attempt-1",
      answers: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects answers exceeding max of 30", () => {
    const answers = Array.from({ length: 31 }, (_, i) => ({
      questionId: `q${i}`,
      answer: "0",
    }))
    const result = diagnosticSubmitSchema.safeParse({
      attemptId: "attempt-1",
      answers,
    })
    expect(result.success).toBe(false)
  })

  it("rejects answer with empty questionId", () => {
    const result = diagnosticSubmitSchema.safeParse({
      attemptId: "attempt-1",
      answers: [{ questionId: "", answer: "1" }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects answer with empty answer string", () => {
    const result = diagnosticSubmitSchema.safeParse({
      attemptId: "attempt-1",
      answers: [{ questionId: "q1", answer: "" }],
    })
    expect(result.success).toBe(false)
  })
})

describe("gradeAnswer", () => {
  it("returns true for correct answer", () => {
    expect(gradeAnswer("1", "1")).toBe(true)
  })

  it("returns false for incorrect answer", () => {
    expect(gradeAnswer("0", "1")).toBe(false)
  })

  it("does strict string comparison", () => {
    expect(gradeAnswer("01", "1")).toBe(false)
  })
})

describe("calculateOverallScore", () => {
  it("returns 1.0 for all correct", () => {
    const answers = [{ correct: true }, { correct: true }, { correct: true }]
    expect(calculateOverallScore(answers)).toBe(1.0)
  })

  it("returns 0.0 for all incorrect", () => {
    const answers = [{ correct: false }, { correct: false }]
    expect(calculateOverallScore(answers)).toBe(0.0)
  })

  it("returns correct ratio", () => {
    const answers = [
      { correct: true },
      { correct: false },
      { correct: true },
      { correct: false },
    ]
    expect(calculateOverallScore(answers)).toBe(0.5)
  })

  it("returns 0 for empty array", () => {
    expect(calculateOverallScore([])).toBe(0)
  })
})

describe("calculateCategoryScores", () => {
  const questionCategories = new Map([
    ["q1", "networking"],
    ["q2", "networking"],
    ["q3", "concurrency"],
    ["q4", "concurrency"],
    ["q5", "data-structures"],
  ])

  it("calculates per-category scores", () => {
    const gradedAnswers = [
      { questionId: "q1", correct: true },
      { questionId: "q2", correct: false },
      { questionId: "q3", correct: true },
      { questionId: "q4", correct: true },
      { questionId: "q5", correct: false },
    ]

    const scores = calculateCategoryScores(gradedAnswers, questionCategories)

    expect(scores.get("networking")).toEqual({
      correct: 1,
      total: 2,
      score: 0.5,
    })
    expect(scores.get("concurrency")).toEqual({
      correct: 2,
      total: 2,
      score: 1.0,
    })
    expect(scores.get("data-structures")).toEqual({
      correct: 0,
      total: 1,
      score: 0,
    })
  })

  it("handles all correct answers", () => {
    const gradedAnswers = [
      { questionId: "q1", correct: true },
      { questionId: "q3", correct: true },
    ]

    const scores = calculateCategoryScores(gradedAnswers, questionCategories)

    expect(scores.get("networking")?.score).toBe(1.0)
    expect(scores.get("concurrency")?.score).toBe(1.0)
  })

  it("ignores questions with unknown IDs", () => {
    const gradedAnswers = [
      { questionId: "unknown", correct: true },
      { questionId: "q1", correct: false },
    ]

    const scores = calculateCategoryScores(gradedAnswers, questionCategories)

    expect(scores.size).toBe(1)
    expect(scores.get("networking")).toEqual({
      correct: 0,
      total: 1,
      score: 0,
    })
  })

  it("returns empty map for no answers", () => {
    const scores = calculateCategoryScores([], questionCategories)
    expect(scores.size).toBe(0)
  })
})
