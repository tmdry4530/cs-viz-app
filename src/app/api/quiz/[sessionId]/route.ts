import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/quiz/[sessionId] - Get quiz questions for session's module
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const session = await prisma.sessionRun.findUnique({
      where: { id: sessionId },
      select: { moduleId: true },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { moduleId: session.moduleId },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        stepJump: true,
      },
    })

    // Get existing attempts for this session
    const attempts = await prisma.quizAttempt.findMany({
      where: { sessionRunId: sessionId },
      select: { questionId: true, answer: true, correct: true },
    })

    return NextResponse.json({ questions, attempts })
  } catch (error) {
    console.error("GET /api/quiz/[sessionId] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    )
  }
}

// POST /api/quiz/[sessionId] - Submit a quiz answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { questionId, answer } = body

    if (!questionId || answer === undefined) {
      return NextResponse.json(
        { error: "questionId and answer are required" },
        { status: 400 }
      )
    }

    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    const correct = String(answer) === question.correctAnswer

    const attempt = await prisma.quizAttempt.create({
      data: {
        sessionRunId: sessionId,
        questionId,
        answer: String(answer),
        correct,
      },
    })

    return NextResponse.json({
      attempt,
      correct,
      explanation: question.explanation,
      stepJump: correct ? null : question.stepJump,
    })
  } catch (error) {
    console.error("POST /api/quiz/[sessionId] error:", error)
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    )
  }
}
