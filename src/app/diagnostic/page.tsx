"use client"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { DiagnosticQuiz } from "@/components/diagnostic/diagnostic-quiz"
import { WeaknessMap } from "@/components/diagnostic/weakness-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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

export default function DiagnosticPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro")
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  const handleComplete = (diagnosticResult: DiagnosticResult) => {
    setResult(diagnosticResult)
    setPhase("result")
  }

  const handleRetry = () => {
    setResult(null)
    setPhase("quiz")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-2 text-3xl font-bold">CS 역량 진단</h1>
          <p className="mb-8 text-muted-foreground">
            20문항으로 CS 기초 역량을 진단하고 약점을 파악하세요.
          </p>

          {phase === "intro" && (
            <Card className="mx-auto max-w-2xl">
              <CardContent className="py-8 text-center">
                <div className="mb-6 text-6xl">&#x1F9E0;</div>
                <h2 className="mb-3 text-xl font-semibold">
                  CS 기초 역량 진단 테스트
                </h2>
                <p className="mb-2 text-muted-foreground">
                  5개 분야에서 총 20문항이 출제됩니다.
                </p>
                <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1">네트워킹</span>
                  <span className="rounded-full bg-muted px-3 py-1">동시성</span>
                  <span className="rounded-full bg-muted px-3 py-1">버전 관리</span>
                  <span className="rounded-full bg-muted px-3 py-1">운영체제</span>
                  <span className="rounded-full bg-muted px-3 py-1">자료구조</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  소요 시간: 약 10-15분
                </p>
                <Button size="lg" onClick={() => setPhase("quiz")}>
                  진단 시작하기
                </Button>
              </CardContent>
            </Card>
          )}

          {phase === "quiz" && <DiagnosticQuiz onComplete={handleComplete} />}

          {phase === "result" && result && (
            <div className="space-y-6">
              <WeaknessMap
                categoryResults={result.categoryResults}
                totalCorrect={result.totalCorrect}
                totalQuestions={result.totalQuestions}
                overallScore={result.score}
              />

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleRetry}>
                  다시 진단하기
                </Button>
                <Button onClick={() => (window.location.href = "/modules")}>
                  학습 모듈로 이동
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
