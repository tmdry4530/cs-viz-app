"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp } from "lucide-react"
import type { WeeklyActivity } from "@/lib/report-generator"

interface GrowthChartProps {
  weeklyActivity: WeeklyActivity[]
}

export function GrowthChart({ weeklyActivity }: GrowthChartProps) {
  const data = weeklyActivity.map((w) => ({
    name: `${w.week}주차`,
    세션: w.sessionsCompleted,
    "학습시간(분)": w.timeMinutes,
    "정답률(%)": w.quizAccuracy,
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="h-4 w-4 text-primary" />
          주간 학습 활동
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="세션" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="정답률(%)" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
