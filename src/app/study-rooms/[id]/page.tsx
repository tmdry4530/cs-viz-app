"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { ChatPanel } from "@/components/study-room/chat-panel"
import { MemberList } from "@/components/study-room/member-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, LogIn, LogOut, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface RoomDetail {
  id: string
  name: string
  description: string | null
  ownerId: string
  isActive: boolean
  maxMembers: number
  members: Array<{
    id: string
    role: string
    user: { id: string; name: string | null; image: string | null }
  }>
  _count: { messages: number }
}

export default function StudyRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const [room, setRoom] = useState<RoomDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const currentUserId = session?.user?.id || ""
  const isMember = room?.members.some((m) => m.user.id === currentUserId) || false
  const isOwner = room?.ownerId === currentUserId

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/study-rooms/${id}`)
      if (res.status === 401) {
        router.push("/login")
        return
      }
      if (res.status === 404) {
        router.push("/study-rooms")
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRoom(data)
    } catch {
      toast.error("스터디 룸을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  const handleJoin = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/study-rooms/${id}/join`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success("스터디 룸에 참여했습니다.")
      fetchRoom()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "참여에 실패했습니다."
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/study-rooms/${id}/leave`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success("스터디 룸에서 나갔습니다.")
      fetchRoom()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "나가기에 실패했습니다."
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("정말 이 스터디 룸을 삭제하시겠습니까?")) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/study-rooms/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success("스터디 룸이 삭제되었습니다.")
      router.push("/study-rooms")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "삭제에 실패했습니다."
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
        <LandingFooter />
      </div>
    )
  }

  if (!room) {
    return null
  }

  const isFull = room.members.length >= room.maxMembers

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <section className="py-8">
          <div className="mx-auto max-w-4xl px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/study-rooms")}
                className="mb-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                목록으로
              </Button>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {room.name}
                  </h1>
                  {room.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {room.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isMember && !isFull && room.isActive && (
                    <Button onClick={handleJoin} disabled={actionLoading}>
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      참여하기
                    </Button>
                  )}
                  {isMember && !isOwner && (
                    <Button
                      variant="outline"
                      onClick={handleLeave}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      나가기
                    </Button>
                  )}
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleDelete}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content: Chat + Members */}
            <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
              <ChatPanel
                roomId={room.id}
                currentUserId={currentUserId}
                isActive={room.isActive}
                isMember={isMember}
              />
              <div className="order-first lg:order-last">
                <MemberList
                  members={room.members}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
