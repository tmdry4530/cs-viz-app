import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getRecommendations } from "@/lib/recommendation"

// GET /api/cs-map/recommendations - Get top 3 recommendations
export async function GET() {
  try {
    const session = await auth()

    // For non-authenticated users, return default recommendations
    if (!session?.user?.id) {
      const recommendations = getRecommendations()
      return NextResponse.json({ recommendations, authenticated: false })
    }

    // For authenticated users, try to fetch weakness data
    // WeaknessMap and completed modules would be used here
    // For now, return recommendations without weakness data
    const recommendations = getRecommendations()
    return NextResponse.json({ recommendations, authenticated: true })
  } catch (error) {
    console.error("GET /api/cs-map/recommendations error:", error)
    return NextResponse.json(
      { error: "추천을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
