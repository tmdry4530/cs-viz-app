import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// POST /api/admin/quiz - Create a quiz question (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { moduleId, type, question, options, correctAnswer, explanation, stepJump } = body

    if (!moduleId || !type || !question || !correctAnswer || !explanation) {
      return NextResponse.json(
        { error: "moduleId, type, question, correctAnswer, and explanation are required" },
        { status: 400 }
      )
    }

    if (!["multiple-choice", "true-false", "fill-in-blank"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 }
      )
    }

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        moduleId,
        type,
        question,
        options: options ?? null,
        correctAnswer,
        explanation,
        stepJump: stepJump ?? null,
      },
    })

    return NextResponse.json(quizQuestion, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/quiz error:", error)
    return NextResponse.json(
      { error: "Failed to create quiz question" },
      { status: 500 }
    )
  }
}
