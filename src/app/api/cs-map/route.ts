import { NextResponse } from "next/server"
import { graphNodes, graphEdges, categories } from "@/lib/cs-map-data"

// GET /api/cs-map - Get full graph data
export async function GET() {
  try {
    return NextResponse.json({
      nodes: graphNodes,
      edges: graphEdges,
      categories,
    })
  } catch (error) {
    console.error("GET /api/cs-map error:", error)
    return NextResponse.json(
      { error: "그래프 데이터를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
