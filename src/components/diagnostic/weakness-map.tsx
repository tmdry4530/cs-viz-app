"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type CategoryResult = {
  correct: number
  total: number
  score: number
}

type WeaknessMapEntry = {
  category: string
  score: number
  updatedAt: string | null
  tested: boolean
}

type Props = {
  // From diagnostic result (post-quiz)
  categoryResults?: Record<string, CategoryResult>
  // From weakness API (stored)
  weaknessMap?: WeaknessMapEntry[]
  totalCorrect?: number
  totalQuestions?: number
  overallScore?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  networking: "네트워킹",
  concurrency: "동시성",
  "version-control": "버전 관리",
  "os-basics": "운영체제",
  "data-structures": "자료구조",
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "text-green-500"
  if (score >= 0.6) return "text-yellow-500"
  if (score >= 0.4) return "text-orange-500"
  return "text-red-500"
}

function getScoreLabel(score: number): string {
  if (score >= 0.8) return "우수"
  if (score >= 0.6) return "양호"
  if (score >= 0.4) return "보통"
  return "보완 필요"
}

export function WeaknessMap({
  categoryResults,
  weaknessMap,
  totalCorrect,
  totalQuestions,
  overallScore,
}: Props) {
  // Build chart data from either source
  const chartData = categoryResults
    ? Object.entries(categoryResults).map(([category, result]) => ({
        category: CATEGORY_LABELS[category] ?? category,
        score: Math.round(result.score * 100),
        fullMark: 100,
      }))
    : weaknessMap
      ? weaknessMap.map((entry) => ({
          category: CATEGORY_LABELS[entry.category] ?? entry.category,
          score: Math.round(entry.score * 100),
          fullMark: 100,
        }))
      : []

  const detailData = categoryResults
    ? Object.entries(categoryResults).map(([category, result]) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        ...result,
      }))
    : weaknessMap
      ? weaknessMap.map((entry) => ({
          category: entry.category,
          label: CATEGORY_LABELS[entry.category] ?? entry.category,
          score: entry.score,
          correct: 0,
          total: 0,
          tested: entry.tested,
        }))
      : []

  const score = overallScore ?? 0

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      {overallScore !== undefined && totalCorrect !== undefined && totalQuestions !== undefined && (
        <Card>
          <CardContent className="py-6 text-center">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {Math.round(score * 100)}점
            </div>
            <p className="mt-1 text-muted-foreground">
              {totalQuestions}문제 중 {totalCorrect}문제 정답
            </p>
            <Badge
              variant="outline"
              className={`mt-2 ${getScoreColor(score)}`}
            >
              {getScoreLabel(score)}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Radar Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">분야별 역량 맵</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "점수"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">분야별 상세 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {detailData.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <span className="font-medium">{item.label}</span>
                  {"correct" in item && item.total > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({item.correct}/{item.total})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.round(item.score * 100)}%` }}
                    />
                  </div>
                  <span
                    className={`min-w-[3rem] text-right text-sm font-medium ${getScoreColor(item.score)}`}
                  >
                    {Math.round(item.score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
