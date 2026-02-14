import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isSpam } from "@/lib/spam-detector"
import { sanitizeInput } from "@/lib/sanitize"

// GET /api/comments - Get comments for a feed post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const feedPostId = searchParams.get("feedPostId")

    if (!feedPostId) {
      return NextResponse.json(
        { error: "feedPostId is required" },
        { status: 400 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: { feedPostId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("GET /api/comments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedPostId, userId, content } = body

    if (!feedPostId || !userId || !content) {
      return NextResponse.json(
        { error: "feedPostId, userId, and content are required" },
        { status: 400 }
      )
    }

    const sanitizedContent = sanitizeInput(content)

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    // Spam check
    const spamResult = isSpam(sanitizedContent, { userId })

    if (spamResult.spam) {
      return NextResponse.json(
        { error: "스팸으로 감지되어 댓글을 작성할 수 없습니다.", spamDetected: true },
        { status: 403 }
      )
    }

    const comment = await prisma.comment.create({
      data: { feedPostId, userId, content: sanitizedContent },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("POST /api/comments error:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
