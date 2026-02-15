"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { categories, type Category } from "@/lib/cs-map-data"
import { getRecommendations, type Recommendation } from "@/lib/recommendation"

export function DailyRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    setRecommendations(getRecommendations())
  }, [])

  if (recommendations.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">오늘의 추천</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {recommendations.map((rec) => {
          const categoryInfo = categories[rec.category as Category]
          const hasModule = !!rec.moduleId

          const content = (
            <Card
              className={
                "transition-colors" +
                (hasModule ? " hover:border-primary/50 hover:bg-accent/50" : "")
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: categoryInfo?.color
                        ? `${categoryInfo.color.replace(")", ", 0.15)")}`
                        : undefined,
                    }}
                  >
                    {categoryInfo?.label ?? rec.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {rec.reason}
                  </span>
                </div>
                <CardTitle className="text-base">{rec.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {hasModule ? (
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <span>모듈 시작</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    관련 모듈 준비 중
                  </p>
                )}
              </CardContent>
            </Card>
          )

          if (hasModule) {
            return (
              <Link key={rec.nodeId} href={`/session/${rec.moduleId}`}>
                {content}
              </Link>
            )
          }

          return <div key={rec.nodeId}>{content}</div>
        })}
      </div>
    </div>
  )
}
