import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkoutSchema } from "@/lib/validations"
import { createCheckoutSession } from "@/lib/stripe-mock"

// POST /api/stripe/checkout - Create a mock checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createCheckoutSession(session.user.id, parsed.data.plan)

    return NextResponse.json(result)
  } catch (error) {
    console.error("POST /api/stripe/checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
