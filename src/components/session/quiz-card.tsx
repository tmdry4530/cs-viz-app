"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Lightbulb, ArrowLeft } from "lucide-react"

interface QuizQuestion {
  id: string
  type: string
  question: string
  options: string[] | null
  stepJump: number | null
}

interface QuizAttempt {
  questionId: string
  answer: string
  correct: boolean
}

interface QuizCardProps {
  sessionId: string | null
  onScoreUpdate: (correct: number, total: number) => void
  onComplete: () => void
}

export function QuizCard({ sessionId, onScoreUpdate, onComplete }: QuizCardProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [lastResult, setLastResult] = useState<{
    correct: boolean
    explanation: string
    stepJump: number | null
  } | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch questions
  useEffect(() => {
    if (!sessionId) return

    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quiz/${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setQuestions(
            data.questions.map((q: QuizQuestion & { options: string | string[] | null }) => ({
              ...q,
              options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
            }))
          )
          setAttempts(data.attempts || [])
          // Skip to first unanswered question
          if (data.attempts?.length > 0) {
            const answeredIds = new Set(data.attempts.map((a: QuizAttempt) => a.questionId))
            const firstUnanswered = data.questions.findIndex(
              (q: QuizQuestion) => !answeredIds.has(q.id)
            )
            if (firstUnanswered >= 0) setCurrentIdx(firstUnanswered)
            else setCurrentIdx(data.questions.length - 1)
          }
        }
      } catch {
        // Fallback to empty
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [sessionId])

  // Update score whenever attempts change
  useEffect(() => {
    const correct = attempts.filter((a) => a.correct).length
    onScoreUpdate(correct, attempts.length)
    if (questions.length > 0 && attempts.length >= questions.length) {
      onComplete()
    }
  }, [attempts, questions.length, onScoreUpdate, onComplete])

  const currentQuestion = questions[currentIdx]
  const alreadyAnswered = currentQuestion
    ? attempts.find((a) => a.questionId === currentQuestion.id)
    : null

  const handleSubmit = useCallback(async () => {
    if (selected === null || !sessionId || !currentQuestion) return

    try {
      const res = await fetch(`/api/quiz/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: String(selected),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setLastResult({
          correct: data.correct,
          explanation: data.explanation,
          stepJump: data.stepJump,
        })
        setSubmitted(true)
        setAttempts((prev) => [
          ...prev,
          { questionId: currentQuestion.id, answer: String(selected), correct: data.correct },
        ])
      }
    } catch {
      // Fallback: local grading
      setSubmitted(true)
    }
  }, [selected, sessionId, currentQuestion])

  const goToNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
      setSubmitted(false)
      setLastResult(null)
      setShowExplanation(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">{"퀴즈 (7분)"}</h3>
        <p className="text-sm text-muted-foreground">퀴즈를 불러오는 중...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">{"퀴즈 (7분)"}</h3>
        <p className="text-sm text-muted-foreground">퀴즈가 아직 준비되지 않았습니다.</p>
      </div>
    )
  }

  const options: string[] = currentQuestion?.options || []
  const isAnswered = submitted || !!alreadyAnswered
  const isCorrect = alreadyAnswered
    ? alreadyAnswered.correct
    : lastResult?.correct ?? false
  const correctIdx = alreadyAnswered
    ? parseInt(alreadyAnswered.answer)
    : lastResult?.correct
      ? selected
      : null

  const correctCount = attempts.filter((a) => a.correct).length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            {"퀴즈 (7분)"}
          </h3>
          <Badge variant="outline" className="border-border/80 text-xs text-muted-foreground">
            {currentIdx + 1} / {questions.length}
          </Badge>
          {attempts.length > 0 && (
            <Badge variant="outline" className="border-border/80 text-xs text-muted-foreground">
              {correctCount}/{attempts.length} 정답
            </Badge>
          )}
        </div>

        <p className="mb-4 text-sm leading-relaxed text-foreground">
          {currentQuestion.question}
        </p>

        <div className="flex flex-col gap-2">
          {options.map((option, i) => {
            let optionStyle =
              "border-border/50 bg-secondary/50 hover:bg-secondary hover:border-border text-foreground"
            if (selected === i && !isAnswered) {
              optionStyle =
                "border-primary/50 bg-primary/10 text-foreground ring-1 ring-primary/30"
            }
            if (isAnswered && lastResult?.correct && selected === i) {
              optionStyle = "border-primary/50 bg-primary/10 text-foreground"
            }
            if (isAnswered && !isCorrect && selected === i) {
              optionStyle = "border-destructive/50 bg-destructive/10 text-foreground"
            }
            // Show correct answer after submission
            if (isAnswered && lastResult && !lastResult.correct && i === parseInt(String(correctIdx))) {
              // We don't know the correct index from server, but we highlight selected
            }

            return (
              <button
                key={i}
                onClick={() => !isAnswered && setSelected(i)}
                disabled={isAnswered}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${optionStyle}`}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {isAnswered && lastResult?.correct && selected === i && (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
                {isAnswered && !isCorrect && selected === i && (
                  <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isAnswered ? (
          <Button onClick={handleSubmit} disabled={selected === null} size="sm">
            정답 제출
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
              해설 보기
            </Button>
            {!isCorrect && lastResult?.stepJump !== null && lastResult?.stepJump !== undefined && (
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Viz로 돌아가기
              </Button>
            )}
            {currentIdx < questions.length - 1 && (
              <Button size="sm" onClick={goToNext}>
                다음 문제
              </Button>
            )}
          </>
        )}
      </div>

      {showExplanation && lastResult && (
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            왜 이게 중요한가
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {lastResult.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
