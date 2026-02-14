"use client"

import { Users, MessageSquare } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RoomCardProps {
  room: {
    id: string
    name: string
    description: string | null
    maxMembers: number
    createdAt: string
    owner: { id: string; name: string | null; image: string | null }
    _count: { members: number; messages: number }
  }
  onClick: () => void
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  const ownerInitial = room.owner.name?.charAt(0) || "?"
  const isFull = room._count.members >= room.maxMembers

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{room.name}</CardTitle>
            {room.description && (
              <CardDescription className="text-sm">
                {room.description}
              </CardDescription>
            )}
          </div>
          {isFull ? (
            <Badge variant="secondary">마감</Badge>
          ) : (
            <Badge variant="outline">참여 가능</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {room._count.members}/{room.maxMembers}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{room._count.messages}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {ownerInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{room.owner.name || "익명"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
