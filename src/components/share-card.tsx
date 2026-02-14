"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Terminal,
  Trophy,
  Clock,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

interface ShareCardProps {
  data: {
    slug: string
    user: { name: string | null; image: string | null }
    module: { title: string; tag: string; color: string }
    score: number | null
    reflection: string | null
    quiz: { total: number; correct: number }
    startedAt: string
    completedAt: string | null
  }
}

export function ShareCard({ data }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("링크가 복사되었습니다.")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("링크 복사에 실패했습니다.")
    }
  }

  const duration = (() => {
    if (!data.completedAt || !data.startedAt) return null
    const diff =
      new Date(data.completedAt).getTime() -
      new Date(data.startedAt).getTime()
    return Math.round(diff / 60000)
  })()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        {/* Header */}
        <div className="border-b border-border/50 bg-secondary/30 px-6 py-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Terminal className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              CS Viz
            </span>
          </div>
          <h2 className="text-balance text-xl font-bold text-foreground">
            30분 동안 이걸 이해했어요
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.module.title}
          </p>
        </div>

        {/* Reflection */}
        {data.reflection && (
          <div className="border-b border-border/50 px-6 py-5">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              3문장 요약
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.reflection}
            </p>
          </div>
        )}

        {/* Score Details */}
        <div className="border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-4">
            {data.score != null && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {data.score}
                </span>
                <span className="text-sm text-muted-foreground">점</span>
              </div>
            )}
            {duration != null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {duration}분 소요
              </div>
            )}
            <Badge variant="secondary" className="text-xs">
              {data.module.tag}
            </Badge>
          </div>
        </div>

        {/* Quiz Results */}
        {data.quiz.total > 0 && (
          <div className="border-b border-border/50 px-6 py-5">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              퀴즈 결과
            </h3>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {data.quiz.total}문제 중 {data.quiz.correct}문제 정답
              </span>
            </div>
          </div>
        )}

        {/* Copy Link + CTA */}
        <div className="flex flex-col gap-3 px-6 py-6">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "복사됨" : "링크 복사"}
          </Button>
          <Link href="/">
            <Button className="w-full" size="lg">
              나도 30분 세션 해보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Author */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {data.user.name || "학습자"}님의 학습 결과
      </p>
    </div>
  )
}
