"use client"

import { VizEngine } from "@/components/viz/viz-engine"
import type { VizEngineHandle } from "@/components/viz/viz-engine"

interface VizCanvasProps {
  moduleId: string
  handle: VizEngineHandle
}

export function VizCanvas({ moduleId, handle }: VizCanvasProps) {
  return (
    <div className="flex h-full min-h-[300px] flex-col rounded-lg border border-border/50 bg-card/50 p-4 lg:min-h-[400px]">
      <VizEngine moduleId={moduleId} handle={handle} />
    </div>
  )
}
