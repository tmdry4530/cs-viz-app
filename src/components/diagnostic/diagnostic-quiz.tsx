"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type Question = {
  id: string
  category: string
  difficulty: string
  question: string
  options: string // JSON stringified array
}

type DiagnosticResult = {
  score: number
  totalCorrect: number
  totalQuestions: number
  categoryResults: Record<
    string,
    { correct: number; total: number; score: number }
  >
  answers: Array<{
    questionId: string
    userAnswer: string
    correctAnswer: string
    correct: boolean
    explanation: string
    category: string
  }>
}

type Props = {
  onComplete: (result: DiagnosticResult) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  networking: "네트워킹",
  concurrency: "동시성",
  "version-control": "버전 관리",
  "os-basics": "운영체제",
  "data-structures": "자료구조",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-red-500/10 text-red-500",
}

export function DiagnosticQuiz({ onComplete }: Props) {
  const [state, setState] = useState<
    "loading" | "quiz" | "submitting" | "error"
  >("loading")
  const [questions, setQuestions] = useState<Question[]>([])
  const [attemptId, setAttemptId] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [error, setError] = useState("")

  const startQuiz = useCallback(async () => {
    setState("loading")
    try {
      const res = await fetch("/api/diagnostic")
      if (!res.ok) throw new Error("Failed to load questions")
      const data = await res.json()
      setQuestions(data.questions)
      setAttemptId(data.attemptId)
      setCurrentIndex(0)
      setAnswers(new Map())
      setSelectedOption(null)
      setState("quiz")
    } catch {
      setError("진단 문제를 불러오지 못했습니다.")
      setState("error")
    }
  }, [])

  // Start quiz on mount
  useState(() => {
    startQuiz()
  })

  const currentQuestion = questions[currentIndex]
  const progress =
    questions.length > 0
      ? ((currentIndex + (selectedOption !== null ? 1 : 0)) /
          questions.length) *
        100
      : 0

  const handleSelect = (optionIndex: string) => {
    setSelectedOption(optionIndex)
  }

  const handleNext = () => {
    if (selectedOption === null || !currentQuestion) return

    const newAnswers = new Map(answers)
    newAnswers.set(currentQuestion.id, selectedOption)
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
    } else {
      // Submit all answers
      submitAnswers(newAnswers)
    }
  }

  const submitAnswers = async (finalAnswers: Map<string, string>) => {
    setState("submitting")
    try {
      const answersArray = Array.from(finalAnswers.entries()).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      )

      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: answersArray }),
      })

      if (!res.ok) throw new Error("Failed to submit")

      const result: DiagnosticResult = await res.json()
      onComplete(result)
    } catch {
      setError("진단 결과 제출에 실패했습니다.")
      setState("error")
    }
  }

  if (state === "loading") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">진단 문제를 준비하고 있습니다...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === "error") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-16 text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button onClick={startQuiz}>다시 시도</Button>
        </CardContent>
      </Card>
    )
  }

  if (state === "submitting") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">결과를 분석하고 있습니다...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentQuestion) return null

  const options: string[] = JSON.parse(currentQuestion.options as string)

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex gap-2">
            <Badge variant="outline">
              {CATEGORY_LABELS[currentQuestion.category] ??
                currentQuestion.category}
            </Badge>
            <Badge
              className={
                DIFFICULTY_COLORS[currentQuestion.difficulty] ?? ""
              }
              variant="outline"
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="text-lg leading-relaxed">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(String(index))}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                selectedOption === String(index)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium">
                {index + 1}
              </span>
              {option}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            size="lg"
          >
            {currentIndex < questions.length - 1 ? "다음" : "제출하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
