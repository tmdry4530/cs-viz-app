"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"
import { Target } from "lucide-react"
import type { CategoryGrowth } from "@/lib/report-generator"

interface CategoryRadarProps {
  categoryGrowth: CategoryGrowth[]
}

export function CategoryRadar({ categoryGrowth }: CategoryRadarProps) {
  const data = categoryGrowth.map((c) => ({
    category: c.category,
    이번달: c.score,
    지난달: c.previousScore,
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4 text-primary" />
          카테고리별 실력 변화
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid className="stroke-border/30" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
            />
            <Radar
              name="지난달"
              dataKey="지난달"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.1}
              strokeDasharray="4 4"
            />
            <Radar
              name="이번달"
              dataKey="이번달"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Growth summary */}
        <div className="mt-2 flex flex-wrap gap-2">
          {categoryGrowth
            .filter((c) => c.growth > 0)
            .sort((a, b) => b.growth - a.growth)
            .slice(0, 3)
            .map((c) => (
              <span
                key={c.category}
                className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500"
              >
                {c.category} +{c.growth}
              </span>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
