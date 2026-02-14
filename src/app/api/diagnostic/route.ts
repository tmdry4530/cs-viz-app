import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { diagnosticSubmitSchema } from "@/lib/validations"

const QUESTION_COUNT = 20

// GET /api/diagnostic - Get random 20 diagnostic questions + create attempt
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all questions grouped by category, then pick proportionally
    const allQuestions = await prisma.diagnosticQuestion.findMany({
      select: {
        id: true,
        category: true,
        difficulty: true,
        question: true,
        options: true,
      },
    })

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No diagnostic questions available" },
        { status: 404 }
      )
    }

    // Group by category
    const byCategory = new Map<string, typeof allQuestions>()
    for (const q of allQuestions) {
      const list = byCategory.get(q.category) || []
      list.push(q)
      byCategory.set(q.category, list)
    }

    // Pick questions proportionally from each category
    const categories = Array.from(byCategory.keys())
    const perCategory = Math.floor(QUESTION_COUNT / categories.length)
    const remainder = QUESTION_COUNT % categories.length

    const selected: typeof allQuestions = []
    for (let i = 0; i < categories.length; i++) {
      const catQuestions = byCategory.get(categories[i])!
      const count = perCategory + (i < remainder ? 1 : 0)
      // Shuffle and pick
      const shuffled = catQuestions.sort(() => Math.random() - 0.5)
      selected.push(...shuffled.slice(0, count))
    }

    // Shuffle the final selection
    selected.sort(() => Math.random() - 0.5)

    // Create a new attempt
    const attempt = await prisma.diagnosticAttempt.create({
      data: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      attemptId: attempt.id,
      questions: selected,
      totalQuestions: selected.length,
    })
  } catch (error) {
    console.error("GET /api/diagnostic error:", error)
    return NextResponse.json(
      { error: "Failed to fetch diagnostic questions" },
      { status: 500 }
    )
  }
}

// POST /api/diagnostic - Submit diagnostic answers, calculate scores, update weakness map
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = diagnosticSubmitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { attemptId, answers } = parsed.data

    // Verify attempt belongs to user
    const attempt = await prisma.diagnosticAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      )
    }

    if (attempt.completedAt) {
      return NextResponse.json(
        { error: "Attempt already completed" },
        { status: 400 }
      )
    }

    // Fetch all questions for this attempt
    const questionIds = answers.map((a) => a.questionId)
    const questions = await prisma.diagnosticQuestion.findMany({
      where: { id: { in: questionIds } },
    })

    const questionMap = new Map(questions.map((q) => [q.id, q]))

    // Grade answers and create records
    const gradedAnswers = answers.map((a) => {
      const question = questionMap.get(a.questionId)
      const correct = question ? a.answer === question.correctAnswer : false
      return {
        attemptId,
        questionId: a.questionId,
        answer: a.answer,
        correct,
      }
    })

    await prisma.diagnosticAnswer.createMany({
      data: gradedAnswers,
    })

    // Calculate scores per category
    const categoryScores = new Map<
      string,
      { correct: number; total: number }
    >()

    for (const graded of gradedAnswers) {
      const question = questionMap.get(graded.questionId)
      if (!question) continue
      const existing = categoryScores.get(question.category) || {
        correct: 0,
        total: 0,
      }
      existing.total++
      if (graded.correct) existing.correct++
      categoryScores.set(question.category, existing)
    }

    // Calculate overall score
    const totalCorrect = gradedAnswers.filter((a) => a.correct).length
    const totalQuestions = gradedAnswers.length
    const overallScore = totalQuestions > 0 ? totalCorrect / totalQuestions : 0

    // Update attempt
    await prisma.diagnosticAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score: overallScore,
      },
    })

    // Update weakness map for each category
    const weaknessUpdates = Array.from(categoryScores.entries()).map(
      ([category, { correct, total }]) => {
        const score = total > 0 ? correct / total : 0
        return prisma.weaknessMap.upsert({
          where: {
            userId_category: {
              userId: session.user!.id!,
              category,
            },
          },
          update: { score },
          create: {
            userId: session.user!.id!,
            category,
            score,
          },
        })
      }
    )

    await Promise.all(weaknessUpdates)

    // Build result
    const categoryResults = Object.fromEntries(
      Array.from(categoryScores.entries()).map(
        ([category, { correct, total }]) => [
          category,
          {
            correct,
            total,
            score: total > 0 ? correct / total : 0,
          },
        ]
      )
    )

    // Return detailed results with explanations
    const detailedAnswers = gradedAnswers.map((a) => {
      const question = questionMap.get(a.questionId)
      return {
        questionId: a.questionId,
        userAnswer: a.answer,
        correctAnswer: question?.correctAnswer,
        correct: a.correct,
        explanation: question?.explanation,
        category: question?.category,
      }
    })

    return NextResponse.json({
      score: overallScore,
      totalCorrect,
      totalQuestions,
      categoryResults,
      answers: detailedAnswers,
    })
  } catch (error) {
    console.error("POST /api/diagnostic error:", error)
    return NextResponse.json(
      { error: "Failed to submit diagnostic" },
      { status: 500 }
    )
  }
}
