"use client"

import { ArrowRight, Play, Clock, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 lg:px-6 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-1.5 text-xs text-muted-foreground">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
            비전공자를 위한 CS 기초 시각화 학습
          </div>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            매일 30분,{" "}
            <span className="text-primary">CS 기초</span>를<br />
            눈으로 이해하세요
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            인터랙티브 시각화, 퀴즈, 실무 적용 과제로 구성된 30분 세션.
            개발자와 의미 있는 대화를 나눌 수 있는 CS 감각을 키워드립니다.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/session/http-journey">
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                첫 세션 시작하기
              </Button>
            </Link>
            <Link href="/modules">
              <Button variant="outline" size="lg" className="gap-2">
                모듈 둘러보기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary/70" />
              <span>세션당 30분</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary/70" />
              <span>인터랙티브 시각화</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary/70" />
              <span>커뮤니티 학습</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
