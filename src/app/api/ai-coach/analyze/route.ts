import { NextRequest, NextResponse } from "next/server"
import { requireFeature } from "@/lib/require-pro"
import { analyzeExplanation } from "@/lib/ai-coach-mock"
import { z } from "zod"

const analyzeSchema = z.object({
  text: z.string().min(1, "분석할 텍스트를 입력하세요").max(5000),
})

export async function POST(request: NextRequest) {
  try {
    const guard = await requireFeature("ai-coach")
    if (!guard.authorized) return guard.response

    const body = await request.json()
    const parsed = analyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = analyzeExplanation(parsed.data.text)
    return NextResponse.json(result)
  } catch (error) {
    console.error("POST /api/ai-coach/analyze error:", error)
    return NextResponse.json(
      { error: "Failed to analyze explanation" },
      { status: 500 }
    )
  }
}
