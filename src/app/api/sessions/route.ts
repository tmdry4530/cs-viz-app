import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/sessions - List user's sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const sessions = await prisma.sessionRun.findMany({
      where: { userId },
      include: {
        module: {
          select: { slug: true, title: true, tag: true, color: true },
        },
      },
      orderBy: { startedAt: "desc" },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("GET /api/sessions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create a new session run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, moduleId } = body

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: "userId and moduleId are required" },
        { status: 400 }
      )
    }

    // Try finding module by id first, then by slug
    let mod = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!mod) {
      mod = await prisma.module.findUnique({ where: { slug: moduleId } })
    }

    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const session = await prisma.sessionRun.create({
      data: {
        userId,
        moduleId: mod.id,
        status: "active",
        checkpointData: {
          stage: "viz",
          timeRemaining: 1800,
        },
      },
      include: { module: true },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions error:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    )
  }
}
