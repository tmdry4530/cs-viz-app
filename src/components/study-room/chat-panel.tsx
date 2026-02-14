"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface Message {
  id: string
  content: string
  createdAt: string
  user: { id: true; name: string | null; image: string | null }
}

interface ChatPanelProps {
  roomId: string
  currentUserId: string
  isActive: boolean
  isMember: boolean
}

const POLL_INTERVAL = 5000

export function ChatPanel({
  roomId,
  currentUserId,
  isActive,
  isMember,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMessageId = useRef<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!isMember) return
    try {
      const res = await fetch(`/api/study-rooms/${roomId}/messages`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages)
      if (data.messages.length > 0) {
        const newLastId = data.messages[data.messages.length - 1].id
        if (lastMessageId.current && newLastId !== lastMessageId.current) {
          // Auto-scroll on new messages
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
        }
        lastMessageId.current = newLastId
      }
    } catch {
      // silent fail for polling
    } finally {
      setLoading(false)
    }
  }, [roomId, isMember])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    // Scroll to bottom on initial load
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView()
    }
  }, [loading, messages.length > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/study-rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "메시지 전송에 실패했습니다.")
      }

      setInput("")
      await fetchMessages()
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "메시지 전송에 실패했습니다."
      )
    } finally {
      setSending(false)
    }
  }

  if (!isMember) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
        방에 참여하면 채팅에 참여할 수 있습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-lg border">
      {/* Messages area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "400px", minHeight: "300px" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.user.id) === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {msg.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : ""}`}
                >
                  {!isMe && (
                    <p className="text-xs text-muted-foreground">
                      {msg.user.name || "익명"}
                    </p>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground ${isMe ? "text-right" : ""}`}>
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {isActive ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            maxLength={500}
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <div className="border-t p-3 text-center text-sm text-muted-foreground">
          비활성 스터디 룸입니다.
        </div>
      )}
    </div>
  )
}
