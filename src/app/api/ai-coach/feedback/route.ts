import { NextRequest, NextResponse } from "next/server"
import { requireFeature } from "@/lib/require-pro"
import { generateFeedback } from "@/lib/ai-coach-mock"
import { z } from "zod"

const feedbackSchema = z.object({
  reflection: z.string().min(1, "리플렉션 내용을 입력하세요").max(2000),
})

export async function POST(request: NextRequest) {
  try {
    const guard = await requireFeature("ai-coach")
    if (!guard.authorized) return guard.response

    const body = await request.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = generateFeedback(parsed.data.reflection)
    return NextResponse.json(result)
  } catch (error) {
    console.error("POST /api/ai-coach/feedback error:", error)
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    )
  }
}
