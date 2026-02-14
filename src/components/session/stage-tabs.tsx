"use client"

import { sessionStages, type StageId } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StageTabsProps {
  activeStage: StageId
  onStageChange: (stage: StageId) => void
  completedStages?: Set<StageId>
}

export function StageTabs({ activeStage, onStageChange, completedStages }: StageTabsProps) {
  const currentIdx = sessionStages.findIndex((s) => s.id === activeStage)

  return (
    <div className="flex items-center gap-1">
      {sessionStages.map((stage, idx) => {
        const isActive = stage.id === activeStage
        const isPast = idx < currentIdx
        const isCompleted = completedStages?.has(stage.id) ?? false

        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground"
                : isPast || isCompleted
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : isCompleted
                    ? "bg-primary/20 text-primary"
                    : isPast
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                idx + 1
              )}
            </span>
            <span className="hidden sm:inline">{stage.label}</span>
            <span className="hidden text-[10px] opacity-70 lg:inline">
              {stage.duration}
            </span>
          </button>
        )
      })}
    </div>
  )
}
