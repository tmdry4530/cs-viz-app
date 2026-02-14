"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ChevronRight } from "lucide-react"

interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick?: (question: string) => void
}

export function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionsProps) {
  if (questions.length === 0) return null

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          꼬리질문으로 더 깊이 생각해보기
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {questions.map((q, i) => (
            <li key={i}>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-sm font-normal text-foreground hover:bg-amber-500/10"
                onClick={() => onQuestionClick?.(q)}
              >
                <ChevronRight className="mr-2 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>{q}</span>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
