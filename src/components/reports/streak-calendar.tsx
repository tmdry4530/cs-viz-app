"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Flame } from "lucide-react"
import type { DailyStreak } from "@/lib/report-generator"

interface StreakCalendarProps {
  dailyStreak: DailyStreak[]
  month: number
  year: number
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

function getHeatColor(sessions: number): string {
  if (sessions === 0) return "bg-muted/50"
  if (sessions === 1) return "bg-green-500/30"
  if (sessions === 2) return "bg-green-500/60"
  return "bg-green-500/90"
}

export function StreakCalendar({ dailyStreak, month, year }: StreakCalendarProps) {
  // Calculate the starting day of the month (0 = Sunday)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const activeDays = dailyStreak.filter((d) => d.active).length

  // Calculate longest streak
  let maxStreak = 0
  let currentStreak = 0
  for (const day of dailyStreak) {
    if (day.active) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            학습 스트릭
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {activeDays}일 활동 / 최장 {maxStreak}일 연속
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {dailyStreak.map((day) => {
              const dayNum = parseInt(day.date.split("-")[2], 10)
              return (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex aspect-square items-center justify-center rounded-sm text-[10px] font-medium transition-colors ${getHeatColor(day.sessionsCount)} ${
                        day.active
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {dayNum}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>
                      {day.date} - {day.sessionsCount}회 학습
                    </p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
          <span>적음</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-muted/50" />
            <div className="h-3 w-3 rounded-sm bg-green-500/30" />
            <div className="h-3 w-3 rounded-sm bg-green-500/60" />
            <div className="h-3 w-3 rounded-sm bg-green-500/90" />
          </div>
          <span>많음</span>
        </div>
      </CardContent>
    </Card>
  )
}
