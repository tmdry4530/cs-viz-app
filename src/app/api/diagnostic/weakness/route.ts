import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

const ALL_CATEGORIES = [
  "networking",
  "concurrency",
  "version-control",
  "os-basics",
  "data-structures",
]

// GET /api/diagnostic/weakness - Get user's weakness map
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const weaknesses = await prisma.weaknessMap.findMany({
      where: { userId: session.user.id },
      select: {
        category: true,
        score: true,
        updatedAt: true,
      },
      orderBy: { category: "asc" },
    })

    // Include all categories, defaulting to 0 for untested ones
    const weaknessMap = ALL_CATEGORIES.map((category) => {
      const existing = weaknesses.find((w) => w.category === category)
      return {
        category,
        score: existing?.score ?? 0,
        updatedAt: existing?.updatedAt ?? null,
        tested: !!existing,
      }
    })

    // Get latest attempt info
    const latestAttempt = await prisma.diagnosticAttempt.findFirst({
      where: {
        userId: session.user.id,
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        score: true,
        completedAt: true,
      },
    })

    return NextResponse.json({
      weaknessMap,
      latestAttempt,
    })
  } catch (error) {
    console.error("GET /api/diagnostic/weakness error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weakness map" },
      { status: 500 }
    )
  }
}
