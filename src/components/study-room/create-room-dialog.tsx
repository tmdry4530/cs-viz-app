"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CreateRoomDialogProps {
  onCreated: () => void
}

export function CreateRoomDialog({ onCreated }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [maxMembers, setMaxMembers] = useState(5)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/study-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          maxMembers,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "방 생성에 실패했습니다.")
      }

      toast.success("스터디 룸이 생성되었습니다.")
      setOpen(false)
      setName("")
      setDescription("")
      setMaxMembers(5)
      onCreated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "방 생성에 실패했습니다."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          스터디 룸 만들기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 스터디 룸</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">방 이름</Label>
            <Input
              id="room-name"
              placeholder="예: 알고리즘 스터디"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-desc">설명 (선택)</Label>
            <Input
              id="room-desc"
              placeholder="스터디 룸에 대한 간단한 설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-members">최대 인원 (2~10)</Label>
            <Input
              id="max-members"
              type="number"
              min={2}
              max={10}
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 5)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            만들기
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
