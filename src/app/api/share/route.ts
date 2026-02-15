import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"

// POST /api/share - Create a share link
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { sessionRunId } = body

    if (!sessionRunId) {
      return NextResponse.json(
        { error: "sessionRunId is required" },
        { status: 400 }
      )
    }

    const userId = session.user.id

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
