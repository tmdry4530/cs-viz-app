"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCode, ScrollText, Eye } from "lucide-react"

const logTask = {
  type: "log" as const,
  title: "로그 보고 원인 고르기",
  description:
    "아래 서버 로그를 보고, 502 에러의 가장 가능성 높은 원인을 선택하세요.",
  log: `[2025-01-15 14:32:01] INFO  Request received: GET /api/users
[2025-01-15 14:32:01] INFO  DNS resolved: 10.0.3.42 (2ms)
[2025-01-15 14:32:01] INFO  TCP connected (15ms)
[2025-01-15 14:32:02] INFO  TLS handshake complete (45ms)
[2025-01-15 14:32:02] INFO  LB forwarded to app-server-03
[2025-01-15 14:32:02] WARN  app-server-03: connection pool exhausted
[2025-01-15 14:32:32] ERROR upstream timeout (30000ms)
[2025-01-15 14:32:32] ERROR 502 Bad Gateway returned to client`,
  options: [
    "DNS 리졸버 실패",
    "TLS 인증서 만료",
    "앱 서버 커넥션 풀 고갈",
    "로드밸런서 설정 오류",
  ],
  correctIndex: 2,
}

const codeTask = {
  type: "code" as const,
  title: "코드 스니펫 한 줄 수정",
  description:
    "아래 코드에서 타임아웃 설정이 너무 길어 장애를 키우고 있습니다. 적절한 값으로 수정하세요.",
  code: `const config = {
  retryAttempts: 5,
  retryDelay: 1000,
  timeout: 300000, // ← 이 줄을 수정하세요
  keepAlive: true,
}`,
  answer: "timeout: 5000, // 5초로 줄여 빠른 실패 유도",
}

export function ApplyTaskCard() {
  const [activeTask, setActiveTask] = useState<"log" | "code">("log")
  const [logAnswer, setLogAnswer] = useState<number | null>(null)
  const [logSubmitted, setLogSubmitted] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">
          {"실무 적용 (6분)"}
        </h3>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTask("log")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTask === "log"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          로그 분석
        </button>
        <button
          onClick={() => setActiveTask("code")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTask === "code"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          코드 수정
        </button>
      </div>

      {activeTask === "log" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {logTask.description}
          </p>

          <div className="overflow-x-auto rounded-lg border border-border/50 bg-background p-3">
            <pre className="font-mono text-xs leading-relaxed text-muted-foreground">
              {logTask.log}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            {logTask.options.map((option, i) => {
              let style =
                "border-border/50 bg-secondary/50 hover:bg-secondary text-foreground"
              if (logAnswer === i && !logSubmitted) {
                style = "border-primary/50 bg-primary/10 text-foreground ring-1 ring-primary/30"
              }
              if (logSubmitted && i === logTask.correctIndex) {
                style = "border-primary/50 bg-primary/10 text-foreground"
              }
              if (logSubmitted && logAnswer === i && logAnswer !== logTask.correctIndex) {
                style = "border-destructive/50 bg-destructive/10 text-foreground"
              }

              return (
                <button
                  key={i}
                  onClick={() => !logSubmitted && setLogAnswer(i)}
                  disabled={logSubmitted}
                  className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-all ${style}`}
                >
                  {option}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2">
            {!logSubmitted ? (
              <Button
                size="sm"
                disabled={logAnswer === null}
                onClick={() => setLogSubmitted(true)}
              >
                제출
              </Button>
            ) : (
              <>
                <Badge
                  variant={
                    logAnswer === logTask.correctIndex ? "default" : "destructive"
                  }
                  className="self-center"
                >
                  {logAnswer === logTask.correctIndex ? "정답" : "오답"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogAnswer(null)
                    setLogSubmitted(false)
                  }}
                >
                  다시 풀기
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {activeTask === "code" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {codeTask.description}
          </p>

          <div className="overflow-x-auto rounded-lg border border-border/50 bg-background p-3">
            <pre className="font-mono text-xs leading-relaxed text-muted-foreground">
              {codeTask.code}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button size="sm">제출</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              모범 답안
            </Button>
            <Button variant="ghost" size="sm">
              내 답 저장
            </Button>
          </div>

          {showAnswer && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="font-mono text-xs text-foreground">
                {codeTask.answer}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                타임아웃이 300초(5분)로 설정되어 있으면, 장애 상황에서 요청이 오래
                대기하며 커넥션 풀을 소모합니다. 5초로 줄이면 빠르게 실패하고
                리소스를 해제할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
