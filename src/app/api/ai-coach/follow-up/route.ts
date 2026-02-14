import { NextRequest, NextResponse } from "next/server"
import { requireFeature } from "@/lib/require-pro"
import { generateFollowUp } from "@/lib/ai-coach-mock"
import { z } from "zod"

const followUpSchema = z.object({
  topic: z.string().min(1, "주제를 입력하세요").max(200),
  context: z.string().max(2000).default(""),
})

export async function POST(request: NextRequest) {
  try {
    const guard = await requireFeature("ai-coach")
    if (!guard.authorized) return guard.response

    const body = await request.json()
    const parsed = followUpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = generateFollowUp(parsed.data.topic, parsed.data.context)
    return NextResponse.json(result)
  } catch (error) {
    console.error("POST /api/ai-coach/follow-up error:", error)
    return NextResponse.json(
      { error: "Failed to generate follow-up questions" },
      { status: 500 }
    )
  }
}
