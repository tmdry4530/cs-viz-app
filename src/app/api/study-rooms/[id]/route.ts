import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireFeature } from "@/lib/require-pro"

// GET /api/study-rooms/[id] - Get room detail
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireFeature("study-room")
    if (!result.authorized) return result.response

    const { id } = await params

    const room = await prisma.studyRoom.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: { select: { messages: true } },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: "스터디 룸을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("GET /api/study-rooms/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch study room" },
      { status: 500 }
    )
  }
}

// DELETE /api/study-rooms/[id] - Delete room (owner only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireFeature("study-room")
    if (!result.authorized) return result.response

    const { id } = await params

    const room = await prisma.studyRoom.findUnique({
      where: { id },
      select: { ownerId: true },
    })

    if (!room) {
      return NextResponse.json(
        { error: "스터디 룸을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (room.ownerId !== result.userId) {
      return NextResponse.json(
        { error: "방장만 삭제할 수 있습니다." },
        { status: 403 }
      )
    }

    await prisma.studyRoom.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/study-rooms/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete study room" },
      { status: 500 }
    )
  }
}
