import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCustomerPortalUrl } from "@/lib/stripe-mock"

// GET /api/stripe/portal - Redirect to mock customer portal
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = getCustomerPortalUrl(session.user.id)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("GET /api/stripe/portal error:", error)
    return NextResponse.json(
      { error: "Failed to get portal URL" },
      { status: 500 }
    )
  }
}
