"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

const sampleComments = [
  {
    id: "1",
    author: "정하윤",
    avatar: "HY",
    text: "커넥션 풀이 고갈되면 새 요청을 처리할 수 없어서 타임아웃이 나는 거군요. 그러면 커넥션 풀 사이즈를 무한정 늘리면 해결되나요?",
    time: "1시간 전",
  },
  {
    id: "2",
    author: "김서연",
    avatar: "SE",
    text: "무한정 늘리면 메모리 문제가 생겨요. 보통은 적절한 사이즈 + 타임아웃 설정으로 관리합니다. 이 세션에서 다루는 내용이에요!",
    time: "45분 전",
  },
]

export function CommentThread() {
  const [newComment, setNewComment] = useState("")

  return (
    <div className="flex flex-col gap-4">
      {sampleComments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-7 w-7 flex-shrink-0 border border-border/50">
            <AvatarFallback className="bg-secondary text-[10px] font-medium text-foreground">
              {comment.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {comment.author}
              </span>
              <span className="text-xs text-muted-foreground">
                {comment.time}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {comment.text}
            </p>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Textarea
          placeholder="꼬리질문을 남겨보세요 (예: '왜 TLS가 여기서 병목이 돼?')"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px] resize-none border-border/50 bg-card text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
        />
        <Button
          size="icon"
          className="h-10 w-10 flex-shrink-0 self-end"
          disabled={newComment.trim().length === 0}
          aria-label="댓글 작성"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
