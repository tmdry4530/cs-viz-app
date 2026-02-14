import { NextRequest, NextResponse } from "next/server"
import { webhookSchema } from "@/lib/validations"
import { handleWebhook } from "@/lib/stripe-mock"

// POST /api/stripe/webhook - Handle mock Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = webhookSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid webhook payload", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await handleWebhook(parsed.data)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("POST /api/stripe/webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
