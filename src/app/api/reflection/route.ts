import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/reflection - Create a reflection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionRunId, userId, content, isPublic } = body

    if (!sessionRunId || !userId || !content) {
      return NextResponse.json(
        { error: "sessionRunId, userId, and content are required" },
        { status: 400 }
      )
    }

    // Validate minimum 3 sentences (rough check: at least 2 periods/question marks/exclamation marks)
    const sentenceEnders = (content.match(/[.!?。]/g) || []).length
    if (sentenceEnders < 2 && content.length < 50) {
      return NextResponse.json(
        { error: "최소 3문장 이상 작성해주세요." },
        { status: 400 }
      )
    }

    const reflection = await prisma.reflection.create({
      data: {
        sessionRunId,
        userId,
        content,
        isPublic: isPublic ?? false,
      },
    })

    return NextResponse.json(reflection, { status: 201 })
  } catch (error) {
    console.error("POST /api/reflection error:", error)
    return NextResponse.json(
      { error: "Failed to create reflection" },
      { status: 500 }
    )
  }
}
