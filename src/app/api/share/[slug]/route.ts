import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/share/[slug] - Get public share data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shareLink = await prisma.shareLink.findUnique({
      where: { slug },
      include: {
        sessionRun: {
          include: {
            module: true,
            quizAttempts: {
              include: { question: { select: { question: true } } },
            },
            applyAttempts: {
              include: { task: { select: { prompt: true } } },
            },
            reflections: {
              where: { isPublic: true },
              select: { content: true, createdAt: true },
            },
          },
        },
        user: { select: { name: true, image: true } },
      },
    })

    if (!shareLink || !shareLink.isActive) {
      return NextResponse.json(
        { error: "Share link not found or inactive" },
        { status: 404 }
      )
    }

    const session = shareLink.sessionRun
    const totalQuiz = session.quizAttempts.length
    const correctQuiz = session.quizAttempts.filter((a) => a.correct).length

    return NextResponse.json({
      slug: shareLink.slug,
      user: shareLink.user,
      module: session.module,
      score: session.score,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      quiz: { total: totalQuiz, correct: correctQuiz },
      applyResults: session.applyAttempts.map((a) => ({
        prompt: a.task.prompt.slice(0, 100),
        correct: a.correct,
      })),
      reflections: session.reflections,
      ogImageUrl: shareLink.ogImageUrl,
    })
  } catch (error) {
    console.error("GET /api/share/[slug] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch share data" },
      { status: 500 }
    )
  }
}

// DELETE /api/share/[slug] - Deactivate a share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const shareLink = await prisma.shareLink.findUnique({
      where: { slug },
    })

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      )
    }

    if (shareLink.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.shareLink.update({
      where: { slug },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/share/[slug] error:", error)
    return NextResponse.json(
      { error: "Failed to delete share link" },
      { status: 500 }
    )
  }
}
