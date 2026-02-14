"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProBadgeProps {
  className?: string
  size?: "sm" | "md"
}

export function ProBadge({ className, size = "sm" }: ProBadgeProps) {
  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 font-bold",
        size === "sm" && "text-[10px] px-1.5 py-0",
        size === "md" && "text-xs px-2 py-0.5",
        className
      )}
    >
      Pro
    </Badge>
  )
}
