import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// PATCH /api/comments/[id] - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, userId } = body

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.comment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("PATCH /api/comments/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const existing = await prisma.comment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}
