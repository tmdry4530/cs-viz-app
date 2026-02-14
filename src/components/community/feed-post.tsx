"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, MessageCircle, Share2, Flag, Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface FeedPostProps {
  post: {
    id: string
    content: string
    score: number | null
    badge: string | null
    createdAt: string
    user: { id: string; name: string | null; image: string | null }
    sessionRun: {
      id: string
      module: { title: string; slug: string; tag: string }
    }
    _count: { comments: number; reactions: number }
  }
}

const reportReasons = [
  { value: "spam", label: "스팸" },
  { value: "inappropriate", label: "부적절한 내용" },
  { value: "harassment", label: "괴롭힘" },
  { value: "other", label: "기타" },
]

export function FeedPost({ post }: FeedPostProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.reactions)
  const [isLiking, setIsLiking] = useState(false)

  const userInitials = post.user.name
    ? post.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: ko,
      })
    } catch {
      return ""
    }
  })()

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) {
      toast.error("로그인이 필요합니다.")
      return
    }
    if (isLiking) return

    // Optimistic update
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    setLiked(newLiked)
    setLikeCount(newCount)
    setIsLiking(true)

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedPostId: post.id,
          userId: session.user.id,
          type: "like",
        }),
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      setLikeCount(data.count)
      setLiked(data.action === "added")
    } catch {
      // Revert optimistic update
      setLiked(!newLiked)
      setLikeCount(newLiked ? newCount - 1 : newCount + 1)
      toast.error("오류가 발생했습니다.")
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/community#post-${post.id}`
      )
      toast.success("링크가 복사되었습니다.")
    } catch {
      toast.error("링크 복사에 실패했습니다.")
    }
  }

  const handleReport = async (reason: string) => {
    if (!session?.user) {
      toast.error("로그인이 필요합니다.")
      return
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "post",
          targetId: post.id,
          userId: session.user.id,
          reason,
        }),
      })

      if (res.status === 409) {
        toast.info("이미 신고한 항목입니다.")
        return
      }
      if (!res.ok) throw new Error()
      toast.success("신고가 접수되었습니다.")
    } catch {
      toast.error("신고 처리 중 오류가 발생했습니다.")
    }
  }

  return (
    <article className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-border/80">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {post.user.name || "익명"}
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-border/80 text-xs text-muted-foreground"
        >
          {post.sessionRun.module.title}
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {post.score != null && (
          <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <Trophy className="h-3 w-3" />
            {post.score}점
          </div>
        )}
        <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {post.sessionRun.module.tag}
        </div>
        {post.badge && (
          <Badge variant="secondary" className="text-xs">
            {post.badge}
          </Badge>
        )}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {post.content}
      </p>

      <div className="flex items-center gap-1 border-t border-border/50 pt-3">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 text-xs ${liked ? "text-primary" : "text-muted-foreground"}`}
          onClick={handleLike}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-primary" : ""}`} />
          좋아요 {likeCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          댓글 {post._count.comments}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground"
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5" />
          공유
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Flag className="h-3.5 w-3.5" />
              신고
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {reportReasons.map((reason) => (
              <DropdownMenuItem
                key={reason.value}
                onClick={(e) => {
                  e.stopPropagation()
                  handleReport(reason.value)
                }}
              >
                {reason.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}
