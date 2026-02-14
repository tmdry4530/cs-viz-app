import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/apply/[sessionId] - Get apply tasks for session's module
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

    const tasks = await prisma.applyTask.findMany({
      where: { moduleId: session.moduleId },
      select: {
        id: true,
        prompt: true,
        hints: true,
      },
    })

    // Get existing attempts
    const attempts = await prisma.applyAttempt.findMany({
      where: { sessionRunId: sessionId },
      select: {
        taskId: true,
        submission: true,
        correct: true,
        feedback: true,
      },
    })

    return NextResponse.json({ tasks, attempts })
  } catch (error) {
    console.error("GET /api/apply/[sessionId] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch apply tasks" },
      { status: 500 }
    )
  }
}

// POST /api/apply/[sessionId] - Submit an apply task answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { taskId, submission } = body

    if (!taskId || !submission) {
      return NextResponse.json(
        { error: "taskId and submission are required" },
        { status: 400 }
      )
    }

    const task = await prisma.applyTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Simple keyword matching for auto-grading
    const solutionKeywords = task.solution
      .toLowerCase()
      .split(/[\s,.:;]+/)
      .filter((w) => w.length > 2)
    const submissionLower = submission.toLowerCase()
    const matchCount = solutionKeywords.filter((kw) =>
      submissionLower.includes(kw)
    ).length
    const correct = matchCount >= Math.ceil(solutionKeywords.length * 0.3)

    const feedback = correct
      ? "정답입니다! 핵심 개념을 잘 이해하고 있습니다."
      : `아쉽지만 틀렸습니다. 힌트: ${task.hints[0] || "다시 시도해보세요."}`

    const attempt = await prisma.applyAttempt.create({
      data: {
        sessionRunId: sessionId,
        taskId,
        submission,
        correct,
        feedback,
      },
    })

    return NextResponse.json({
      attempt,
      correct,
      feedback,
      solution: correct ? task.solution : undefined,
    })
  } catch (error) {
    console.error("POST /api/apply/[sessionId] error:", error)
    return NextResponse.json(
      { error: "Failed to submit apply task" },
      { status: 500 }
    )
  }
}
