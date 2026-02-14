"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2, Flag, Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { FeedPost as FeedPostType } from "@/lib/data"

export function FeedPost({ post }: { post: FeedPostType }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <article className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-border/80">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">
              {post.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {post.author}
            </p>
            <p className="text-xs text-muted-foreground">{post.createdAt}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-border/80 text-xs text-muted-foreground"
        >
          {post.module}
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          <Trophy className="h-3 w-3" />
          {post.score}점
        </div>
        <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {post.duration}
        </div>
        <Badge
          variant="secondary"
          className="text-xs"
        >
          {post.badge}
        </Badge>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {post.summary}
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
        >
          <MessageCircle className="h-3.5 w-3.5" />
          댓글 {post.comments}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground"
        >
          <Share2 className="h-3.5 w-3.5" />
          공유
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 gap-1.5 text-xs text-muted-foreground"
        >
          <Flag className="h-3.5 w-3.5" />
          신고
        </Button>
      </div>
    </article>
  )
}
