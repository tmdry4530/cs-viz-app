"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, Lightbulb, Send } from "lucide-react"

interface ApplyTask {
  id: string
  prompt: string
  hints: string[]
}

interface ApplyAttempt {
  taskId: string
  submission: string
  correct: boolean
  feedback: string | null
}

interface ApplyTaskCardProps {
  sessionId: string | null
  onComplete: () => void
}

export function ApplyTaskCard({ sessionId, onComplete }: ApplyTaskCardProps) {
  const [tasks, setTasks] = useState<ApplyTask[]>([])
  const [attempts, setAttempts] = useState<ApplyAttempt[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [submission, setSubmission] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<{
    correct: boolean
    feedback: string
    solution?: string
  } | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch tasks
  useEffect(() => {
    if (!sessionId) return

    async function fetchTasks() {
      try {
        const res = await fetch(`/api/apply/${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setTasks(data.tasks || [])
          setAttempts(data.attempts || [])
          // Skip to first unattempted task
          if (data.attempts?.length > 0) {
            const attemptedIds = new Set(data.attempts.map((a: ApplyAttempt) => a.taskId))
            const firstUnattempted = data.tasks.findIndex(
              (t: ApplyTask) => !attemptedIds.has(t.id)
            )
            if (firstUnattempted >= 0) setCurrentIdx(firstUnattempted)
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [sessionId])

  // Check completion
  useEffect(() => {
    if (tasks.length > 0 && attempts.length >= tasks.length) {
      onComplete()
    }
  }, [attempts.length, tasks.length, onComplete])

  const currentTask = tasks[currentIdx]
  const alreadyAttempted = currentTask
    ? attempts.find((a) => a.taskId === currentTask.id)
    : null

  const handleSubmit = async () => {
    if (!sessionId || !currentTask || !submission.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/apply/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: currentTask.id,
          submission: submission.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setLastResult({
          correct: data.correct,
          feedback: data.feedback,
          solution: data.solution,
        })
        setAttempts((prev) => [
          ...prev,
          {
            taskId: currentTask.id,
            submission: submission.trim(),
            correct: data.correct,
            feedback: data.feedback,
          },
        ])
      }
    } catch {
      // Fallback
    } finally {
      setSubmitting(false)
    }
  }

  const goToNext = () => {
    if (currentIdx < tasks.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setSubmission("")
      setLastResult(null)
      setShowHints(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">{"실무 적용 (6분)"}</h3>
        <p className="text-sm text-muted-foreground">과제를 불러오는 중...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">{"실무 적용 (6분)"}</h3>
        <p className="text-sm text-muted-foreground">과제가 아직 준비되지 않았습니다.</p>
      </div>
    )
  }

  const isAnswered = !!lastResult || !!alreadyAttempted

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">
          {"실무 적용 (6분)"}
        </h3>
        <Badge variant="outline" className="border-border/80 text-xs text-muted-foreground">
          {currentIdx + 1} / {tasks.length}
        </Badge>
      </div>

      {/* Task prompt */}
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-lg border border-border/50 bg-background p-3">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
            {currentTask.prompt}
          </pre>
        </div>

        {/* Submission area */}
        {!isAnswered && (
          <Textarea
            placeholder="답변을 입력하세요..."
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            className="min-h-[100px] resize-none border-border/50 bg-card text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
          />
        )}

        {/* Result display */}
        {isAnswered && (
          <div
            className={`rounded-lg border p-4 ${
              (lastResult?.correct ?? alreadyAttempted?.correct)
                ? "border-primary/30 bg-primary/5"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              {(lastResult?.correct ?? alreadyAttempted?.correct) ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {(lastResult?.correct ?? alreadyAttempted?.correct) ? "정답" : "오답"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {lastResult?.feedback ?? alreadyAttempted?.feedback}
            </p>
            {lastResult?.solution && (
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-muted-foreground">모범 답안:</p>
                <p className="mt-1 text-sm text-foreground">{lastResult.solution}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!isAnswered ? (
            <>
              <Button
                size="sm"
                disabled={!submission.trim() || submitting}
                onClick={handleSubmit}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {submitting ? "제출 중..." : "제출"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
                힌트 보기
              </Button>
            </>
          ) : (
            currentIdx < tasks.length - 1 && (
              <Button size="sm" onClick={goToNext}>
                다음 과제
              </Button>
            )
          )}
        </div>

        {/* Hints */}
        {showHints && currentTask.hints.length > 0 && (
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
            <h4 className="mb-2 text-sm font-semibold text-foreground">힌트</h4>
            <ul className="flex flex-col gap-1.5">
              {currentTask.hints.map((hint, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    {i + 1}
                  </span>
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
