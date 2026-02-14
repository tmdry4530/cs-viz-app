"use client"

import { MonitorPlay } from "lucide-react"

export function VizCanvas() {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-card/50 lg:min-h-[400px]">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <MonitorPlay className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Visualization Placeholder
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            인터랙티브 시각화가 여기에 표시됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
