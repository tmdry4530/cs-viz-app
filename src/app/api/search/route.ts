import { NextRequest, NextResponse } from "next/server"
import { searchQuerySchema } from "@/lib/validations"
import { searchModules, searchUsers } from "@/lib/search"

// GET /api/search?q=keyword&type=module|user|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = {
      q: searchParams.get("q") || "",
      type: searchParams.get("type") || undefined,
    }

    const parsed = searchQuerySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { q, type } = parsed.data

    const results: {
      modules?: ReturnType<typeof searchModules>
      users?: ReturnType<typeof searchUsers>
    } = {}

    if (type === "all" || type === "module") {
      results.modules = searchModules(q)
    }

    if (type === "all" || type === "user") {
      results.users = searchUsers(q)
    }

    return NextResponse.json({ query: q, type, ...results })
  } catch (error) {
    console.error("GET /api/search error:", error)
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
