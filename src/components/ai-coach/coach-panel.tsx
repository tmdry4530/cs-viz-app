"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeedbackCard } from "./feedback-card"
import { FollowUpQuestions } from "./follow-up-questions"
import { Bot, Send, Loader2, BarChart3 } from "lucide-react"

interface AnalysisResult {
  score: number
  grade: string
  suggestions: string[]
  strengths: string[]
}

interface FeedbackResult {
  feedback: string
  encouragement: string
}

interface CoachPanelProps {
  sessionTopic?: string
  reflectionText?: string
}

export function CoachPanel({ sessionTopic, reflectionText }: CoachPanelProps) {
  const [input, setInput] = useState(reflectionText || "")
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [followUps, setFollowUps] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetFeedback = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)

    try {
      const [feedbackRes, followUpRes, analyzeRes] = await Promise.all([
        fetch("/api/ai-coach/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reflection: input.trim() }),
        }),
        fetch("/api/ai-coach/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: sessionTopic || "CS 개념",
            context: input.trim(),
          }),
        }),
        fetch("/api/ai-coach/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input.trim() }),
        }),
      ])

      if (!feedbackRes.ok || !followUpRes.ok || !analyzeRes.ok) {
        const errBody = await feedbackRes.json().catch(() => null)
        throw new Error(errBody?.error || "AI 코치 요청에 실패했습니다.")
      }

      const [feedbackData, followUpData, analyzeData] = await Promise.all([
        feedbackRes.json(),
        followUpRes.json(),
        analyzeRes.json(),
      ])

      setFeedback(feedbackData)
      setFollowUps(followUpData.questions)
      setAnalysis(analyzeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    setInput((prev) => prev + "\n\n" + question)
  }

  const gradeColor = (grade: string) => {
    switch (grade) {
      case "S": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "A": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "B": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "C": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            AI 학습 코치
            <Badge variant="outline" className="ml-auto text-xs">
              Pro
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="설명한 내용을 입력하면 AI 코치가 피드백을 드려요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] resize-none border-border/50 bg-secondary/30 text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{input.length}자</span>
              <span>최대 2,000자</span>
            </div>
          </div>

          <Button
            onClick={handleGetFeedback}
            disabled={!input.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                피드백 받기
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Analysis Score */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-primary" />
              설명력 분석
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-lg font-bold ${gradeColor(analysis.grade)}`}
                >
                  {analysis.grade}
                </Badge>
                <span className="text-xs text-muted-foreground">등급</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">설명력 점수</span>
                  <span className="font-semibold text-foreground">
                    {analysis.score}점
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>
            </div>

            {analysis.strengths.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-green-500">
                  잘한 점
                </p>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground"
                    >
                      + {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-amber-500">
                  개선할 점
                </p>
                <ul className="space-y-1">
                  {analysis.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground"
                    >
                      - {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      {feedback && (
        <FeedbackCard
          feedback={feedback.feedback}
          encouragement={feedback.encouragement}
        />
      )}

      {/* Follow-up Questions */}
      {followUps.length > 0 && (
        <FollowUpQuestions
          questions={followUps}
          onQuestionClick={handleQuestionClick}
        />
      )}
    </div>
  )
}
