import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isSpam } from "@/lib/spam-detector"
import { sanitizeInput } from "@/lib/sanitize"
import { rateLimiters } from "@/lib/rate-limit"

// GET /api/community - Get community feed with pagination and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const sort = searchParams.get("sort") || "popular" // popular | recent

    const skip = (page - 1) * limit

    const orderBy =
      sort === "recent"
        ? { createdAt: "desc" as const }
        : { reactions: { _count: "desc" as const } }

    const [posts, total] = await Promise.all([
      prisma.feedPost.findMany({
        where: { isPublic: true },
        include: {
          user: { select: { id: true, name: true, image: true } },
          sessionRun: {
            include: {
              module: { select: { title: true, slug: true, tag: true } },
            },
          },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: sort === "recent" ? { createdAt: "desc" } : { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.feedPost.count({ where: { isPublic: true } }),
    ])

    // If sorting by popular, sort by reaction count in memory
    const sortedPosts =
      sort === "popular"
        ? posts.sort((a, b) => b._count.reactions - a._count.reactions)
        : posts

    return NextResponse.json({
      posts: sortedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/community error:", error)
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    )
  }
}

// POST /api/community - Create a feed post with spam check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionRunId, userId, content, score, badge } = body

    if (!sessionRunId || !userId || !content) {
      return NextResponse.json(
        { error: "sessionRunId, userId, and content are required" },
        { status: 400 }
      )
    }

    // Rate limit check
    const rl = rateLimiters.api(userId)
    if (!rl.success) {
      return NextResponse.json(
        { error: "요청이 너무 빠릅니다. 잠시 후 다시 시도하세요." },
        { status: 429 }
      )
    }

    const sanitizedContent = sanitizeInput(content)

    if (sanitizedContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    // Count recent posts for rapid posting detection
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const recentPostCount = await prisma.feedPost.count({
      where: {
        userId,
        createdAt: { gte: oneMinuteAgo },
      },
    })

    // Spam check
    const spamResult = isSpam(sanitizedContent, { userId, recentPostCount })

    if (spamResult.spam) {
      // Create the post but immediately hide it
      const post = await prisma.feedPost.create({
        data: {
          sessionRunId,
          userId,
          content: sanitizedContent,
          score: score ?? null,
          badge: badge ?? null,
          isPublic: false,
        },
      })

      // Create auto-report for spam
      await prisma.report.create({
        data: {
          targetType: "post",
          targetId: post.id,
          userId: "system",
          reason: `[자동감지] ${spamResult.reason}`,
          status: "pending",
        },
      })

      // Create admin action record
      await prisma.adminAction.create({
        data: {
          reportId: (
            await prisma.report.findFirst({
              where: { targetId: post.id, userId: "system" },
              orderBy: { createdAt: "desc" },
            })
          )!.id,
          adminId: "system",
          action: "spam-detected",
          note: `자동 스팸 감지 (신뢰도: ${spamResult.confidence}): ${spamResult.reason}`,
        },
      })

      return NextResponse.json(
        { error: "스팸으로 감지되어 게시물이 숨겨졌습니다.", spamDetected: true },
        { status: 403 }
      )
    }

    const post = await prisma.feedPost.create({
      data: {
        sessionRunId,
        userId,
        content: sanitizedContent,
        score: score ?? null,
        badge: badge ?? null,
        isPublic: true,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        sessionRun: {
          include: {
            module: { select: { title: true, slug: true, tag: true } },
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("POST /api/community error:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
