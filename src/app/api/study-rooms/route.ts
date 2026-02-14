import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireFeature } from "@/lib/require-pro"
import { createRoomSchema } from "@/lib/validations"

// GET /api/study-rooms - List active study rooms
export async function GET() {
  try {
    const result = await requireFeature("study-room")
    if (!result.authorized) return result.response

    const rooms = await prisma.studyRoom.findMany({
      where: { isActive: true },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { members: true, messages: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("GET /api/study-rooms error:", error)
    return NextResponse.json(
      { error: "Failed to fetch study rooms" },
      { status: 500 }
    )
  }
}

// POST /api/study-rooms - Create a new study room
export async function POST(request: NextRequest) {
  try {
    const result = await requireFeature("study-room")
    if (!result.authorized) return result.response

    const body = await request.json()
    const parsed = createRoomSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, description, maxMembers } = parsed.data

    const room = await prisma.studyRoom.create({
      data: {
        name,
        description,
        maxMembers,
        ownerId: result.userId,
        members: {
          create: {
            userId: result.userId,
            role: "owner",
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { members: true, messages: true } },
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error("POST /api/study-rooms error:", error)
    return NextResponse.json(
      { error: "Failed to create study room" },
      { status: 500 }
    )
  }
}
