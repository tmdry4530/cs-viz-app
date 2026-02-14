"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "./stat-card"
import { GrowthChart } from "./growth-chart"
import { StreakCalendar } from "./streak-calendar"
import { CategoryRadar } from "./category-radar"
import {
  BookOpen,
  Clock,
  Target,
  Flame,
  Star,
  MessageSquare,
  Heart,
  Trophy,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react"
import type { MonthlyReportData, ReportHighlight } from "@/lib/report-generator"

interface MonthlyReportProps {
  report: MonthlyReportData
}

const MONTH_NAMES = [
  "", "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
]

function getHighlightIcon(type: ReportHighlight["type"]) {
  switch (type) {
    case "achievement": return Trophy
    case "milestone": return Award
    case "streak": return Zap
    case "improvement": return TrendingUp
  }
}

function getHighlightColor(type: ReportHighlight["type"]) {
  switch (type) {
    case "achievement": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
    case "milestone": return "bg-purple-500/10 border-purple-500/20 text-purple-500"
    case "streak": return "bg-orange-500/10 border-orange-500/20 text-orange-500"
    case "improvement": return "bg-green-500/10 border-green-500/20 text-green-500"
  }
}

export function MonthlyReport({ report }: MonthlyReportProps) {
  const { summary, categoryGrowth, dailyStreak, weeklyActivity, highlights, comparison } = report
  const monthLabel = `${report.year}년 ${MONTH_NAMES[report.month]}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-2">
          Pro
        </Badge>
        <h2 className="text-2xl font-bold text-foreground">
          {monthLabel} 학습 리포트
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이번 달 학습 여정을 돌아보세요
        </p>
      </div>

      {/* Top Topic Highlight */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-full bg-primary/20 p-3">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">이번 달 TOP 주제</p>
            <p className="text-lg font-semibold text-foreground">
              {summary.topTopic}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="완료 세션"
          value={summary.sessionsCompleted}
          suffix="회"
          change={comparison.sessionsChange}
        />
        <StatCard
          icon={Clock}
          label="총 학습 시간"
          value={summary.totalTimeMinutes}
          suffix="분"
          change={comparison.timeChange}
        />
        <StatCard
          icon={Target}
          label="퀴즈 정답률"
          value={summary.quizAccuracy}
          suffix="%"
          change={comparison.accuracyChange}
        />
        <StatCard
          icon={Flame}
          label="활동 일수"
          value={summary.streakDays}
          suffix="일"
          change={comparison.streakChange}
        />
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={MessageSquare}
          label="커뮤니티 게시글"
          value={summary.communityPosts}
          suffix="개"
        />
        <StatCard
          icon={Heart}
          label="받은 반응"
          value={summary.communityReactions}
          suffix="개"
        />
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            이번 달 하이라이트
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {highlights.map((h, i) => {
              const Icon = getHighlightIcon(h.type)
              const colorClass = getHighlightColor(h.type)
              return (
                <Card key={i} className={`border ${colorClass}`}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {h.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {h.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {h.value}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Streak Calendar */}
      <StreakCalendar
        dailyStreak={dailyStreak}
        month={report.month}
        year={report.year}
      />

      {/* Growth Chart */}
      <GrowthChart weeklyActivity={weeklyActivity} />

      {/* Category Radar */}
      <CategoryRadar categoryGrowth={categoryGrowth} />
    </div>
  )
}
