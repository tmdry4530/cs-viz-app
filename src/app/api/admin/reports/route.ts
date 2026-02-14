import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// POST /api/admin/reports - Process a report (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, action, note } = body

    if (!reportId || !action) {
      return NextResponse.json(
        { error: "reportId and action are required" },
        { status: 400 }
      )
    }

    if (!["dismiss", "hide", "warn", "ban", "auto-hide", "spam-detected", "restore"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Handle restore action: make post public again
    if (action === "restore") {
      if (report.targetType === "post") {
        await prisma.feedPost.update({
          where: { id: report.targetId },
          data: { isPublic: true },
        })
      }

      await prisma.$transaction([
        prisma.adminAction.create({
          data: {
            reportId,
            adminId: session.user.id,
            action: "restore",
            note: note || "관리자에 의해 복원됨",
          },
        }),
        prisma.report.update({
          where: { id: reportId },
          data: { status: "dismissed" },
        }),
      ])

      return NextResponse.json({ success: true, restored: true })
    }

    // Create admin action and update report status
    const transactions = [
      prisma.adminAction.create({
        data: {
          reportId,
          adminId: session.user.id,
          action,
          note: note || null,
        },
      }),
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: action === "dismiss" ? "dismissed" : "resolved",
        },
      }),
    ]

    // If action is "hide", also hide the target content
    if (action === "hide" && report.targetType === "post") {
      transactions.push(
        prisma.feedPost.update({
          where: { id: report.targetId },
          data: { isPublic: false },
        }) as any
      )
    }

    await prisma.$transaction(transactions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/admin/reports error:", error)
    return NextResponse.json(
      { error: "Failed to process report" },
      { status: 500 }
    )
  }
}
