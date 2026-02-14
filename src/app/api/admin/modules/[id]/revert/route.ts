import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// POST /api/admin/modules/[id]/revert - Revert to a specific version
export async function POST(
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
    const { versionId } = body

    if (!versionId) {
      return NextResponse.json(
        { error: "versionId is required" },
        { status: 400 }
      )
    }

    // Get the version to revert to
    const version = await prisma.moduleVersion.findUnique({
      where: { id: versionId },
    })

    if (!version || version.moduleId !== id) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      )
    }

    const versionData = version.data as Record<string, unknown>

    // Save current state as a new version before reverting
    const current = await prisma.module.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      )
    }

    const latestVersion = await prisma.moduleVersion.findFirst({
      where: { moduleId: id },
      orderBy: { version: "desc" },
      select: { version: true },
    })

    const nextVersion = (latestVersion?.version ?? 0) + 1

    // Create backup version and revert in transaction
    await prisma.$transaction([
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
          changelog: `버전 ${version.version}으로 복원 전 백업`,
          createdBy: session.user.id,
        },
      }),
      prisma.module.update({
        where: { id },
        data: {
          title: versionData.title as string,
          subtitle: versionData.subtitle as string,
          outcomes: versionData.outcomes as string[],
          difficulty: versionData.difficulty as string,
          time: versionData.time as string,
          tag: versionData.tag as string,
          color: versionData.color as string,
          vizConfig: versionData.vizConfig ?? undefined,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      revertedToVersion: version.version,
    })
  } catch (error) {
    console.error("POST /api/admin/modules/[id]/revert error:", error)
    return NextResponse.json(
      { error: "Failed to revert module" },
      { status: 500 }
    )
  }
}
