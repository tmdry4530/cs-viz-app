"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Bookmark, Share2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { VizCanvas } from "./viz-canvas"
import { VizControls } from "./viz-controls"
import { StageTabs } from "./stage-tabs"
import { QuizCard } from "./quiz-card"
import { ApplyTaskCard } from "./apply-task-card"
import { ReflectionComposer } from "./reflection-composer"
import { sessionStages, type StageId } from "@/lib/data"
import type { Module } from "@/lib/data"
import { CheckCircle2 } from "lucide-react"

interface SessionPlayerShellProps {
  module: Module
}

export function SessionPlayerShell({ module }: SessionPlayerShellProps) {
  const [activeStage, setActiveStage] = useState<StageId>("viz")
  const [timeLeft] = useState("24:30")

  const stageIdx = sessionStages.findIndex((s) => s.id === activeStage)
  const progressValue = ((stageIdx + 1) / sessionStages.length) * 100

  const goBack = () => {
    if (stageIdx > 0) setActiveStage(sessionStages[stageIdx - 1].id)
  }
  const goNext = () => {
    if (stageIdx < sessionStages.length - 1)
      setActiveStage(sessionStages[stageIdx + 1].id)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href="/modules" aria-label="뒤로">
                <ChevronLeft className="h-4 w-4" />
              </a>
            </Button>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold text-foreground truncate max-w-[200px] lg:max-w-none">
                {module.title}
              </h1>
            </div>
          </div>

          <div className="hidden md:block">
            <StageTabs activeStage={activeStage} onStageChange={setActiveStage} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{timeLeft}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="체크포인트 저장">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-2">
          <StageTabs activeStage={activeStage} onStageChange={setActiveStage} />
        </div>

        <Progress value={progressValue} className="h-0.5 rounded-none" />
      </div>

      {/* Main Content - 2 Panel Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 lg:flex-row lg:p-6">
        {/* Left: Visualization */}
        <div className="flex flex-col gap-4 lg:w-3/5">
          <VizCanvas />
          <VizControls />
        </div>

        {/* Right: Context Panel */}
        <div className="flex flex-col gap-5 lg:w-2/5">
          {/* Goal */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              목표
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {module.subtitle}의 전체 흐름을 시각적으로 이해하고, 각 단계의 역할을 설명할 수 있다.
            </p>
          </div>

          {/* What to Notice */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              주목할 포인트
            </p>
            <ul className="flex flex-col gap-1.5">
              {module.outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stage Content */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            {activeStage === "viz" && (
              <div className="flex flex-col gap-3">
                <Badge variant="outline" className="self-start border-border/80 text-muted-foreground">
                  Viz 단계
                </Badge>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  왼쪽 시각화를 재생하면서 각 단계가 어떤 순서로 발생하는지 관찰하세요. 컨트롤을 사용해 속도를 조절하거나 특정 구간을 반복 재생할 수 있습니다.
                </p>
              </div>
            )}
            {activeStage === "quiz" && <QuizCard />}
            {activeStage === "apply" && <ApplyTaskCard />}
            {activeStage === "reflection" && <ReflectionComposer />}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={stageIdx === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            뒤로
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
              체크포인트 저장
            </Button>
            {stageIdx === sessionStages.length - 1 ? (
              <Button size="sm">
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                공유 카드 만들기
              </Button>
            ) : (
              <Button size="sm" onClick={goNext}>
                다음
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
