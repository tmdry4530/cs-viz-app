import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/sessions/[id] - Get session detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await prisma.sessionRun.findUnique({
      where: { id },
      include: {
        module: true,
        quizAttempts: { include: { question: true } },
        applyAttempts: { include: { task: true } },
        reflections: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("GET /api/sessions/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    )
  }
}

// PATCH /api/sessions/[id] - Update checkpoint or complete session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { checkpointData, status, score } = body

    const updateData: Record<string, unknown> = {}

    if (checkpointData !== undefined) {
      updateData.checkpointData = checkpointData
    }

    if (status !== undefined) {
      updateData.status = status
      if (status === "completed") {
        updateData.completedAt = new Date()
      }
    }

    if (score !== undefined) {
      updateData.score = score
    }

    const session = await prisma.sessionRun.update({
      where: { id },
      data: updateData,
      include: { module: true },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error("PATCH /api/sessions/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    )
  }
}
