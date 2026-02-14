import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/reports - Create a report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetType, targetId, userId, reason } = body

    if (!targetType || !targetId || !userId || !reason) {
      return NextResponse.json(
        { error: "targetType, targetId, userId, and reason are required" },
        { status: 400 }
      )
    }

    if (!["post", "comment"].includes(targetType)) {
      return NextResponse.json(
        { error: "targetType must be 'post' or 'comment'" },
        { status: 400 }
      )
    }

    // Check for duplicate report
    const existing = await prisma.report.findFirst({
      where: { targetType, targetId, userId, status: "pending" },
    })

    if (existing) {
      return NextResponse.json(
        { error: "이미 신고한 항목입니다." },
        { status: 409 }
      )
    }

    const report = await prisma.report.create({
      data: {
        targetType,
        targetId,
        userId,
        reason: reason.trim(),
      },
    })

    // Auto-hide: check total reports for this target
    const totalReports = await prisma.report.count({
      where: { targetType, targetId },
    })

    if (totalReports >= 3) {
      // Auto-hide the target content
      if (targetType === "post") {
        await prisma.feedPost.update({
          where: { id: targetId },
          data: { isPublic: false },
        })
      }

      // Create auto admin action
      await prisma.adminAction.create({
        data: {
          reportId: report.id,
          adminId: "system",
          action: "auto-hide",
          note: `신고 ${totalReports}건 누적으로 자동 숨김 처리`,
        },
      })
    }

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("POST /api/reports error:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}
