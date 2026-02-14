"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Sparkles } from "lucide-react"

interface FeedbackCardProps {
  feedback: string
  encouragement: string
}

export function FeedbackCard({ feedback, encouragement }: FeedbackCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-primary" />
          AI 코치 피드백
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-foreground">{feedback}</p>
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs text-primary">{encouragement}</p>
        </div>
      </CardContent>
    </Card>
  )
}
