import { NextRequest, NextResponse } from "next/server"
import { requireFeature } from "@/lib/require-pro"
import { generateMonthlyReport } from "@/lib/report-generator"
import { z } from "zod"

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2030),
})

export async function GET(request: NextRequest) {
  try {
    const guard = await requireFeature("monthly-report")
    if (!guard.authorized) return guard.response

    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      month: searchParams.get("month"),
      year: searchParams.get("year"),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "month(1-12)와 year(2020-2030)를 지정하세요." },
        { status: 400 }
      )
    }

    const report = generateMonthlyReport(
      guard.userId,
      parsed.data.month,
      parsed.data.year
    )

    return NextResponse.json(report)
  } catch (error) {
    console.error("GET /api/reports/monthly error:", error)
    return NextResponse.json(
      { error: "Failed to generate monthly report" },
      { status: 500 }
    )
  }
}
