"use client"

import { Crown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Member {
  id: string
  role: string
  user: { id: string; name: string | null; image: string | null }
}

interface MemberListProps {
  members: Member[]
  currentUserId: string
}

export function MemberList({ members, currentUserId }: MemberListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        멤버 ({members.length})
      </h3>
      <div className="space-y-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {member.user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm truncate">
              {member.user.name || "익명"}
              {member.user.id === currentUserId && (
                <span className="ml-1 text-xs text-muted-foreground">(나)</span>
              )}
            </span>
            {member.role === "owner" && (
              <Badge variant="secondary" className="h-5 gap-0.5 px-1.5 text-[10px]">
                <Crown className="h-3 w-3" />
                방장
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
