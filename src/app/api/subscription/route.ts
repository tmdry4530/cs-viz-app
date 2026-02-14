import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getPlan, getFeatureAccess } from "@/lib/feature-flags"

// GET /api/subscription - Get current user's subscription status
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        plan: true,
        status: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
    })

    const plan = await getPlan(session.user.id)
    const features = await getFeatureAccess(session.user.id)

    return NextResponse.json({
      plan,
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            createdAt: subscription.createdAt,
          }
        : null,
      features,
    })
  } catch (error) {
    console.error("GET /api/subscription error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
