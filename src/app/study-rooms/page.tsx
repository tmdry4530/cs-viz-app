"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { RoomCard } from "@/components/study-room/room-card"
import { CreateRoomDialog } from "@/components/study-room/create-room-dialog"
import { Loader2 } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string | null
  maxMembers: number
  createdAt: string
  owner: { id: string; name: string | null; image: string | null }
  _count: { members: number; messages: number }
}

export default function StudyRoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/study-rooms")
      if (res.status === 401) {
        router.push("/login")
        return
      }
      if (res.status === 403) {
        setError("Pro 구독이 필요한 기능입니다.")
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRooms(data.rooms)
      setError(null)
    } catch {
      setError("스터디 룸 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <section className="py-12">
          <div className="mx-auto max-w-2xl px-4 lg:px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  스터디 룸
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  함께 공부하고 실시간으로 소통하세요.
                </p>
              </div>
              {!error && <CreateRoomDialog onCreated={fetchRooms} />}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  아직 스터디 룸이 없습니다.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  첫 번째 스터디 룸을 만들어보세요!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => router.push(`/study-rooms/${room.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
