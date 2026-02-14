import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET /api/admin/modules/[id] - Get single module with versions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const mod = await prisma.module.findUnique({
      where: { id },
      include: {
        quizQuestions: true,
        versions: {
          orderBy: { version: "desc" },
          take: 10,
        },
        _count: {
          select: { sessionRuns: true, quizQuestions: true },
        },
      },
    })

    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json(mod)
  } catch (error) {
    console.error("GET /api/admin/modules/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/modules/[id] - Update module and auto-create version
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, subtitle, outcomes, difficulty, time, tag, color, vizConfig, changelog } = body

    // Get current module for version snapshot
    const current = await prisma.module.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Get latest version number
    const latestVersion = await prisma.moduleVersion.findFirst({
      where: { moduleId: id },
      orderBy: { version: "desc" },
      select: { version: true },
    })

    const nextVersion = (latestVersion?.version ?? 0) + 1

    // Create version snapshot and update module in transaction
    const [version, updated] = await prisma.$transaction([
      prisma.moduleVersion.create({
        data: {
          moduleId: id,
          version: nextVersion,
          data: {
            title: current.title,
            subtitle: current.subtitle,
            outcomes: current.outcomes,
            difficulty: current.difficulty,
            time: current.time,
            tag: current.tag,
            color: current.color,
            vizConfig: current.vizConfig,
          },
          changelog: changelog || `버전 ${nextVersion} 생성`,
          createdBy: session.user.id,
        },
      }),
      prisma.module.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(subtitle !== undefined && { subtitle }),
          ...(outcomes !== undefined && { outcomes }),
          ...(difficulty !== undefined && { difficulty }),
          ...(time !== undefined && { time }),
          ...(tag !== undefined && { tag }),
          ...(color !== undefined && { color }),
          ...(vizConfig !== undefined && { vizConfig }),
        },
      }),
    ])

    return NextResponse.json({ module: updated, version })
  } catch (error) {
    console.error("PUT /api/admin/modules/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    )
  }
}
