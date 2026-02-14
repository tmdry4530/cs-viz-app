"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react"

const quizData = {
  question: "HTTP 요청이 서버에 도달하기 전, DNS 리졸버가 가장 먼저 확인하는 것은?",
  options: [
    "서버의 SSL 인증서",
    "로컬 DNS 캐시",
    "로드밸런서 상태",
    "TCP 연결 가능 여부",
  ],
  correctIndex: 1,
  explanation:
    "DNS 리졸버는 네트워크 요청을 보내기 전에 먼저 로컬 캐시를 확인합니다. 캐시에 해당 도메인의 IP가 있으면 네트워크 왕복 없이 바로 응답할 수 있어 지연 시간이 크게 줄어듭니다. 이것이 DNS 캐시 TTL(Time To Live) 설정이 중요한 이유입니다.",
  whyImportant:
    "DNS 조회 실패나 TTL 만료는 갑작스러운 레이턴시 증가의 흔한 원인입니다. 장애 상황에서 DNS 캐시를 이해하면 문제의 근본 원인을 빠르게 파악할 수 있습니다.",
}

export function QuizCard() {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [confidence, setConfidence] = useState<string | null>(null)

  const isCorrect = selected === quizData.correctIndex

  const handleSubmit = () => {
    if (selected !== null) setSubmitted(true)
  }

  const handleReset = () => {
    setSelected(null)
    setSubmitted(false)
    setShowExplanation(false)
    setConfidence(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            {"퀴즈 (7분)"}
          </h3>
          {confidence && (
            <Badge
              variant="outline"
              className="border-border/80 text-xs text-muted-foreground"
            >
              {"이해도: " + confidence}
            </Badge>
          )}
        </div>

        <p className="mb-4 text-sm leading-relaxed text-foreground">
          {quizData.question}
        </p>

        <div className="flex flex-col gap-2">
          {quizData.options.map((option, i) => {
            let optionStyle =
              "border-border/50 bg-secondary/50 hover:bg-secondary hover:border-border text-foreground"
            if (selected === i && !submitted) {
              optionStyle =
                "border-primary/50 bg-primary/10 text-foreground ring-1 ring-primary/30"
            }
            if (submitted && i === quizData.correctIndex) {
              optionStyle =
                "border-primary/50 bg-primary/10 text-foreground"
            }
            if (submitted && selected === i && !isCorrect) {
              optionStyle =
                "border-destructive/50 bg-destructive/10 text-foreground"
            }

            return (
              <button
                key={i}
                onClick={() => !submitted && setSelected(i)}
                disabled={submitted}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${optionStyle}`}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {submitted && i === quizData.correctIndex && (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
                {submitted && selected === i && !isCorrect && (
                  <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selected === null}
            size="sm"
          >
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
            <Button variant="ghost" size="sm" onClick={handleReset}>
              다시 풀기
            </Button>
          </>
        )}

        {submitted && !confidence && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">이해도:</span>
            {["낮음", "중간", "높음"].map((level) => (
              <button
                key={level}
                onClick={() => setConfidence(level)}
                className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      {showExplanation && (
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            왜 이게 중요한가
          </h4>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {quizData.explanation}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {quizData.whyImportant}
          </p>
        </div>
      )}
    </div>
  )
}
