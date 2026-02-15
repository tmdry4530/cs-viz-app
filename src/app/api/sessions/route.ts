import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET /api/sessions - List user's sessions
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const sessions = await prisma.sessionRun.findMany({
      where: { userId: session.user.id },
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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { moduleId } = body

    if (!moduleId) {
      return NextResponse.json(
        { error: "moduleId is required" },
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

    const sessionRun = await prisma.sessionRun.create({
      data: {
        userId: session.user.id,
        moduleId: mod.id,
        status: "active",
        checkpointData: {
          stage: "viz",
          timeRemaining: 1800,
        },
      },
      include: { module: true },
    })

    return NextResponse.json(sessionRun, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions error:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    )
  }
}
