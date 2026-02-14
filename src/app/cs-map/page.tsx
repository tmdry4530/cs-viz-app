import { KnowledgeGraph } from "@/components/cs-map/knowledge-graph"
import { DailyRecommendations } from "@/components/cs-map/daily-recommendations"

export const metadata = {
  title: "CS Map - 선행지식 그래프",
  description: "CS 토픽 간의 선행지식 관계를 한눈에 파악하세요",
}

export default function CSMapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">CS Map</h1>
        <p className="text-muted-foreground">
          CS 토픽 간의 선행지식 관계를 시각적으로 탐색하세요. 점선 원이 있는
          노드는 학습 모듈이 연결되어 있어 클릭하면 바로 시작할 수 있습니다.
        </p>
      </div>

      <div className="space-y-8">
        <KnowledgeGraph />
        <DailyRecommendations />
      </div>
    </div>
  )
}
