import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

// POST /api/share - Create a share link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionRunId, userId } = body

    if (!sessionRunId || !userId) {
      return NextResponse.json(
        { error: "sessionRunId and userId are required" },
        { status: 400 }
      )
    }

    // Check if share link already exists for this session
    const existing = await prisma.shareLink.findFirst({
      where: { sessionRunId, userId, isActive: true },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const slug = nanoid(10)

    const shareLink = await prisma.shareLink.create({
      data: {
        sessionRunId,
        userId,
        slug,
        isActive: true,
      },
    })

    return NextResponse.json(shareLink, { status: 201 })
  } catch (error) {
    console.error("POST /api/share error:", error)
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    )
  }
}
