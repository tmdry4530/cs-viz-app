import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireFeature } from "@/lib/require-pro"
import { sendMessageSchema } from "@/lib/validations"

// GET /api/study-rooms/[id]/messages - Get messages with cursor pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireFeature("study-room")
    if (!result.authorized) return result.response

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

    // Verify room exists and user is a member
    const member = await prisma.studyRoomMember.findUnique({
      where: { roomId_userId: { roomId: id, userId: result.userId } },
    })

    if (!member) {
      return NextResponse.json(
        { error: "방에 참여해야 메시지를 볼 수 있습니다." },
        { status: 403 }
      )
    }

    const messages = await prisma.studyRoomMessage.findMany({
      where: { roomId: id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      take: limit,
    })

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null

    return NextResponse.json({ messages, nextCursor })
  } catch (error) {
    console.error("GET /api/study-rooms/[id]/messages error:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST /api/study-rooms/[id]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireFeature("study-room")
    if (!result.authorized) return result.response

    const { id } = await params
    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Verify room is active
    const room = await prisma.studyRoom.findUnique({
      where: { id },
      select: { isActive: true },
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

    // Verify membership
    const member = await prisma.studyRoomMember.findUnique({
      where: { roomId_userId: { roomId: id, userId: result.userId } },
    })

    if (!member) {
      return NextResponse.json(
        { error: "방에 참여해야 메시지를 보낼 수 있습니다." },
        { status: 403 }
      )
    }

    const message = await prisma.studyRoomMessage.create({
      data: {
        roomId: id,
        userId: result.userId,
        content: parsed.data.content,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("POST /api/study-rooms/[id]/messages error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
