import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireFeature } from "@/lib/require-pro"

// POST /api/study-rooms/[id]/leave - Leave a study room
export async function POST(
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

    if (room.ownerId === result.userId) {
      return NextResponse.json(
        { error: "방장은 방을 나갈 수 없습니다. 방을 삭제하세요." },
        { status: 400 }
      )
    }

    const member = await prisma.studyRoomMember.findUnique({
      where: { roomId_userId: { roomId: id, userId: result.userId } },
    })

    if (!member) {
      return NextResponse.json(
        { error: "방에 참여하고 있지 않습니다." },
        { status: 400 }
      )
    }

    await prisma.studyRoomMember.delete({
      where: { roomId_userId: { roomId: id, userId: result.userId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/study-rooms/[id]/leave error:", error)
    return NextResponse.json(
      { error: "Failed to leave study room" },
      { status: 500 }
    )
  }
}
