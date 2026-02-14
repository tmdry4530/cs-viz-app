"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trophy,
  Clock,
  Target,
  Flame,
  BookOpen,
  CheckCircle2,
} from "lucide-react"

const stats = [
  { label: "완료 세션", value: "12", icon: BookOpen, color: "text-primary" },
  { label: "평균 점수", value: "88", icon: Target, color: "text-chart-2" },
  { label: "총 학습 시간", value: "6h", icon: Clock, color: "text-chart-3" },
  { label: "연속 학습", value: "5일", icon: Flame, color: "text-chart-4" },
]

const completedModules = [
  {
    title: "HTTP 요청의 여정",
    score: 92,
    date: "2025-02-10",
    badge: "Network 마스터",
  },
  {
    title: "동시성/비동기 직관",
    score: 85,
    date: "2025-02-09",
    badge: "Concurrency 탐험가",
  },
  {
    title: "Git 3영역 + PR 루프",
    score: 95,
    date: "2025-02-08",
    badge: "Git 마스터",
  },
]

const badges = [
  "Network 마스터",
  "Concurrency 탐험가",
  "Git 마스터",
  "첫 세션 완료",
  "5일 연속 학습",
]

export function ProfileView() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border/50">
            <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
              SY
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">김서연</h1>
            <p className="text-sm text-muted-foreground">
              PM / 비전공자 CS 학습 중
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-border/50 bg-card"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Learning Progress */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                학습 진행도
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { label: "Network", progress: 80 },
                { label: "OS/Concurrency", progress: 60 },
                { label: "DevTools", progress: 90 },
                { label: "Database", progress: 20 },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      {item.progress}%
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                획득 배지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5"
                  >
                    <Trophy className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Sessions */}
        <Card className="mt-6 border-border/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              완료한 세션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {completedModules.map((mod) => (
                <div
                  key={mod.title}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {mod.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mod.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {mod.badge}
                    </Badge>
                    <span className="text-sm font-bold text-primary">
                      {mod.score}점
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
