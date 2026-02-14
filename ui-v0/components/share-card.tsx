"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Terminal, Trophy, Clock, CheckCircle2, XCircle, MonitorPlay, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ShareCard() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        {/* Header */}
        <div className="border-b border-border/50 bg-secondary/30 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Terminal className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">CS Viz</span>
          </div>
          <h2 className="text-xl font-bold text-foreground text-balance">
            30분 동안 이걸 이해했어요
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            HTTP 요청 한 번에 서버에서 일어나는 일
          </p>
        </div>

        {/* Summary */}
        <div className="border-b border-border/50 px-6 py-5">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            요약 (5줄)
          </h3>
          <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
            <p>1. HTTP 요청은 DNS 조회에서 시작해 TCP/TLS 연결을 거쳐 서버에 도달합니다.</p>
            <p>2. 로드밸런서가 요청을 적절한 앱 서버로 분배합니다.</p>
            <p>3. 앱 서버는 DB에서 데이터를 가져와 응답을 만듭니다.</p>
            <p>4. 각 단계에서 병목이 발생할 수 있으며, 타임아웃과 재시도 설정이 핵심입니다.</p>
            <p>5. 로그를 읽을 때 각 단계의 지연시간을 확인하면 문제를 빠르게 찾을 수 있습니다.</p>
          </div>
        </div>

        {/* Score Details */}
        <div className="border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">92</span>
              <span className="text-sm text-muted-foreground">점</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              28분 소요
            </div>
          </div>
        </div>

        {/* Correct / Incorrect */}
        <div className="border-b border-border/50 px-6 py-5">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {"내가 맞힌/틀린 포인트"}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">
                DNS 리졸버가 로컬 캐시를 먼저 확인한다는 점
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">
                커넥션 풀 고갈이 502의 주요 원인인 점
              </span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
              <span className="text-sm text-muted-foreground">
                TLS 핸드셰이크 순서를 혼동함
              </span>
            </div>
          </div>
        </div>

        {/* Viz Snapshot */}
        <div className="border-b border-border/50 px-6 py-5">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Viz 스냅샷
          </h3>
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 bg-secondary/30">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MonitorPlay className="h-8 w-8" />
              <span className="text-xs">정적 시각화 이미지</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 py-6">
          <Link href="/">
            <Button className="w-full" size="lg">
              나도 30분 세션 해보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
