"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { useRouter } from "next/navigation"
import { useVizForModule } from "@/components/viz/viz-engine"

interface SessionPlayerShellProps {
  module: Module
}

// Stage durations in seconds
const STAGE_DURATIONS: Record<StageId, number> = {
  viz: 12 * 60,
  quiz: 7 * 60,
  apply: 6 * 60,
  reflection: 3 * 60,
}

export function SessionPlayerShell({ module }: SessionPlayerShellProps) {
  const router = useRouter()
  const vizHandle = useVizForModule(module.id)
  const [activeStage, setActiveStage] = useState<StageId>("viz")
  const [completedStages, setCompletedStages] = useState<Set<StageId>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 min total
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })
  const [isCreating, setIsCreating] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSaveRef = useRef<number>(0)

  // Create session on mount
  useEffect(() => {
    async function createSession() {
      try {
        // For now use a placeholder userId - will be replaced by auth
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "local-dev-user",
            moduleId: module.id,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setSessionId(data.id)
          // Restore checkpoint if exists
          if (data.checkpointData) {
            const cp = data.checkpointData
            if (cp.stage) setActiveStage(cp.stage as StageId)
            if (cp.timeRemaining) setTimeRemaining(cp.timeRemaining)
            if (cp.completedStages) {
              setCompletedStages(new Set(cp.completedStages))
            }
            if (cp.quizScore) setQuizScore(cp.quizScore)
          }
        }
      } catch {
        // Fallback: work without session ID (offline mode)
      } finally {
        setIsCreating(false)
      }
    }
    createSession()
  }, [module.id])

  // Timer countdown
  useEffect(() => {
    if (isPaused || isCreating) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, isCreating])

  // Pause timer when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden)
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Auto-advance stages based on elapsed time
  useEffect(() => {
    const totalTime = 1800
    const elapsed = totalTime - timeRemaining
    let accumulated = 0

    for (const stage of sessionStages) {
      accumulated += STAGE_DURATIONS[stage.id]
      if (elapsed < accumulated) {
        // Don't auto-advance if user manually navigated
        break
      }
    }
  }, [timeRemaining])

  // Save checkpoint
  const saveCheckpoint = useCallback(
    async (force = false) => {
      if (!sessionId) return
      const now = Date.now()
      // Debounce: save at most every 10 seconds unless forced
      if (!force && now - lastSaveRef.current < 10000) return
      lastSaveRef.current = now

      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkpointData: {
              stage: activeStage,
              timeRemaining,
              completedStages: Array.from(completedStages),
              quizScore,
            },
          }),
        })
      } catch {
        // Silent fail for checkpoint saves
      }
    },
    [sessionId, activeStage, timeRemaining, completedStages, quizScore]
  )

  // Save on stage change
  useEffect(() => {
    saveCheckpoint(true)
  }, [activeStage, saveCheckpoint])

  const handleStageComplete = useCallback(
    (stageId: StageId) => {
      setCompletedStages((prev) => {
        const next = new Set(prev)
        next.add(stageId)
        return next
      })
    },
    []
  )

  const handleQuizComplete = useCallback(() => handleStageComplete("quiz"), [handleStageComplete])
  const handleApplyComplete = useCallback(() => handleStageComplete("apply"), [handleStageComplete])
  const handleReflectionComplete = useCallback(() => handleStageComplete("reflection"), [handleStageComplete])

  const handleQuizScore = useCallback(
    (correct: number, total: number) => {
      setQuizScore({ correct, total })
    },
    []
  )

  // Complete session
  const completeSession = useCallback(async () => {
    if (!sessionId) return

    const score = Math.round(
      ((quizScore.correct / Math.max(quizScore.total, 1)) * 70) +
        (completedStages.size / sessionStages.length) * 30
    )

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          score,
        }),
      })
    } catch {
      // Silent
    }

    return score
  }, [sessionId, quizScore, completedStages])

  // Share card creation
  const handleShareCard = useCallback(async () => {
    await completeSession()

    if (!sessionId) return

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionRunId: sessionId,
          userId: "local-dev-user",
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/share/${data.slug}`)
      }
    } catch {
      // Fallback
    }
  }, [sessionId, completeSession, router])

  const stageIdx = sessionStages.findIndex((s) => s.id === activeStage)
  const progressValue = ((stageIdx + 1) / sessionStages.length) * 100

  const goBack = () => {
    if (stageIdx > 0) {
      handleStageComplete(activeStage)
      setActiveStage(sessionStages[stageIdx - 1].id)
    }
  }
  const goNext = () => {
    if (stageIdx < sessionStages.length - 1) {
      handleStageComplete(activeStage)
      setActiveStage(sessionStages[stageIdx + 1].id)
    }
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
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
            <StageTabs
              activeStage={activeStage}
              onStageChange={setActiveStage}
              completedStages={completedStages}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 text-xs ${
                timeRemaining < 60
                  ? "text-destructive"
                  : timeRemaining < 300
                    ? "text-yellow-500"
                    : "text-muted-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="체크포인트 저장"
              onClick={() => saveCheckpoint(true)}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-2">
          <StageTabs
            activeStage={activeStage}
            onStageChange={setActiveStage}
            completedStages={completedStages}
          />
        </div>

        <Progress value={progressValue} className="h-0.5 rounded-none" />
      </div>

      {/* Main Content - 2 Panel Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 lg:flex-row lg:p-6">
        {/* Left: Visualization */}
        <div className="flex flex-col gap-4 lg:w-3/5">
          <VizCanvas moduleId={module.id} handle={vizHandle} />
          <VizControls handle={vizHandle} />
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
            {activeStage === "quiz" && (
              <QuizCard
                sessionId={sessionId}
                onScoreUpdate={handleQuizScore}
                onComplete={handleQuizComplete}
              />
            )}
            {activeStage === "apply" && (
              <ApplyTaskCard
                sessionId={sessionId}
                onComplete={handleApplyComplete}
              />
            )}
            {activeStage === "reflection" && (
              <ReflectionComposer
                sessionId={sessionId}
                userId="local-dev-user"
                onComplete={handleReflectionComplete}
              />
            )}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveCheckpoint(true)}
            >
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
              체크포인트 저장
            </Button>
            {stageIdx === sessionStages.length - 1 ? (
              <Button size="sm" onClick={handleShareCard}>
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
