"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Send, Pencil, Trash2, Loader2, X, Check } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { sanitizeInput } from "@/lib/sanitize"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

export function CommentThread({ postId }: { postId: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?feedPostId=${postId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComments(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async () => {
    if (!session?.user || !newComment.trim()) return
    setSubmitting(true)

    try {
      const sanitized = sanitizeInput(newComment, 1000)
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedPostId: postId,
          userId: session.user.id,
          content: sanitized,
        }),
      })

      if (!res.ok) throw new Error()
      const comment = await res.json()
      setComments((prev) => [...prev, comment])
      setNewComment("")
    } catch {
      toast.error("댓글 작성에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!session?.user || !editContent.trim()) return

    try {
      const sanitized = sanitizeInput(editContent, 1000)
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: sanitized,
          userId: session.user.id,
        }),
      })

      if (!res.ok) throw new Error()
      const updated = await res.json()
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      )
      setEditingId(null)
      setEditContent("")
    } catch {
      toast.error("댓글 수정에 실패했습니다.")
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!session?.user) return

    try {
      const res = await fetch(
        `/api/comments/${commentId}?userId=${session.user.id}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error()
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success("댓글이 삭제되었습니다.")
    } catch {
      toast.error("댓글 삭제에 실패했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => {
        const initials = comment.user.name
          ? comment.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "?"

        const isOwner = session?.user?.id === comment.user.id
        const isEditing = editingId === comment.id

        const timeAgo = (() => {
          try {
            return formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ko,
            })
          } catch {
            return ""
          }
        })()

        return (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-7 w-7 flex-shrink-0 border border-border/50">
              <AvatarFallback className="bg-secondary text-[10px] font-medium text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.user.name || "익명"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo}
                </span>
                {isOwner && !isEditing && (
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditContent(comment.content)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="mt-1 flex gap-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[40px] resize-none border-border/50 bg-card text-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(null)
                        setEditContent("")
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {comment.content}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {comments.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          아직 댓글이 없습니다.
        </p>
      )}

      {session?.user ? (
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
            disabled={newComment.trim().length === 0 || submitting}
            onClick={handleSubmit}
            aria-label="댓글 작성"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          댓글을 작성하려면 로그인하세요.
        </p>
      )}
    </div>
  )
}
