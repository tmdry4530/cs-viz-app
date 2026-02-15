"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trophy,
  Clock,
  Target,
  Flame,
  BookOpen,
  Loader2,
} from "lucide-react"

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileView() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <section className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </section>
    )
  }

  if (!session?.user) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-muted-foreground">로그인이 필요합니다.</p>
        </div>
      </section>
    )
  }

  const user = session.user

  const stats = [
    { label: "완료 세션", value: "0", icon: BookOpen, color: "text-primary" },
    { label: "평균 점수", value: "-", icon: Target, color: "text-chart-2" },
    { label: "총 학습 시간", value: "0h", icon: Clock, color: "text-chart-3" },
    { label: "연속 학습", value: "0일", icon: Flame, color: "text-chart-4" },
  ]

  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border/50">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
            <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user.name ?? "사용자"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50 bg-card">
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                세션을 완료하면 학습 진행도가 표시됩니다.
              </p>
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>아직 획득한 배지가 없습니다.</span>
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
            <p className="text-sm text-muted-foreground">
              첫 세션을 완료하면 여기에 기록됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
