import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// PUT /api/admin/quiz/[id] - Update a quiz question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { type, question, options, correctAnswer, explanation, stepJump } = body

    const existing = await prisma.quizQuestion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Quiz question not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.quizQuestion.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(question !== undefined && { question }),
        ...(options !== undefined && { options }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(stepJump !== undefined && { stepJump }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/admin/quiz/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update quiz question" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/quiz/[id] - Delete a quiz question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const existing = await prisma.quizQuestion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Quiz question not found" },
        { status: 404 }
      )
    }

    await prisma.quizQuestion.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/quiz/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete quiz question" },
      { status: 500 }
    )
  }
}
