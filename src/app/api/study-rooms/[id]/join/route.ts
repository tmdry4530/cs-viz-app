import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireFeature } from "@/lib/require-pro"

// POST /api/study-rooms/[id]/join - Join a study room
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
      include: { _count: { select: { members: true } } },
    })

    if (!room) {
      return NextResponse.json(
        { error: "스터디 룸을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: "비활성 스터디 룸입니다." },
        { status: 400 }
      )
    }

    // Check if already a member
    const existing = await prisma.studyRoomMember.findUnique({
      where: { roomId_userId: { roomId: id, userId: result.userId } },
    })

    if (existing) {
      return NextResponse.json(
        { error: "이미 참여 중인 방입니다." },
        { status: 400 }
      )
    }

    // Check max members
    if (room._count.members >= room.maxMembers) {
      return NextResponse.json(
        { error: "방이 가득 찼습니다." },
        { status: 400 }
      )
    }

    const member = await prisma.studyRoomMember.create({
      data: {
        roomId: id,
        userId: result.userId,
        role: "member",
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("POST /api/study-rooms/[id]/join error:", error)
    return NextResponse.json(
      { error: "Failed to join study room" },
      { status: 500 }
    )
  }
}
