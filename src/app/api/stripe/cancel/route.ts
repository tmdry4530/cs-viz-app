import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cancelSubscription } from "@/lib/stripe-mock"

// POST /api/stripe/cancel - Cancel the current user's subscription
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    if (subscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription already canceled" },
        { status: 400 }
      )
    }

    const result = await cancelSubscription(subscription.stripeSubscriptionId)

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Subscription canceled" })
  } catch (error) {
    console.error("POST /api/stripe/cancel error:", error)
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    )
  }
}
