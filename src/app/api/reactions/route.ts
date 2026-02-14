import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/reactions - Toggle a reaction (like/unlike)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedPostId, userId, type } = body

    if (!feedPostId || !userId || !type) {
      return NextResponse.json(
        { error: "feedPostId, userId, and type are required" },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    const existing = await prisma.reaction.findUnique({
      where: {
        feedPostId_userId_type: { feedPostId, userId, type },
      },
    })

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({ where: { id: existing.id } })
      const count = await prisma.reaction.count({ where: { feedPostId, type } })
      return NextResponse.json({ action: "removed", count })
    }

    // Add reaction (toggle on)
    await prisma.reaction.create({
      data: { feedPostId, userId, type },
    })
    const count = await prisma.reaction.count({ where: { feedPostId, type } })

    return NextResponse.json({ action: "added", count })
  } catch (error) {
    console.error("POST /api/reactions error:", error)
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    )
  }
}
