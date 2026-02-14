"use client"

import { HttpJourney, HTTP_STEPS } from "./http-journey"
import { ConcurrencyViz, CONCURRENCY_STEPS } from "./concurrency-viz"
import { GitAreasViz, GIT_STEPS } from "./git-areas-viz"
import { useVizEngine } from "./use-viz-engine"
import type { VizStep } from "./use-viz-engine"

export type VizId = "http-journey" | "concurrency" | "git-pr"

const VIZ_CONFIGS: Record<VizId, VizStep[]> = {
  "http-journey": HTTP_STEPS,
  "concurrency": CONCURRENCY_STEPS,
  "git-pr": GIT_STEPS,
}

const FAILURE_MODES: Record<VizId, { id: string; label: string }[]> = {
  "http-journey": [
    { id: "timeout", label: "Timeout" },
    { id: "502", label: "502 Error" },
    { id: "retry-storm", label: "Retry Storm" },
  ],
  "concurrency": [
    { id: "deadlock", label: "Deadlock" },
    { id: "contention", label: "Lock Contention" },
  ],
  "git-pr": [
    { id: "conflict", label: "Merge Conflict" },
  ],
}

export interface VizEngineHandle {
  state: ReturnType<typeof useVizEngine>["state"]
  togglePlay: () => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  setSpeed: (s: number) => void
  setStep: (i: number) => void
  setFailureMode: (m: string | null) => void
  failureModes: { id: string; label: string }[]
}

export function useVizForModule(moduleId: string): VizEngineHandle {
  const vizId = (moduleId as VizId) in VIZ_CONFIGS ? (moduleId as VizId) : "http-journey"
  const steps = VIZ_CONFIGS[vizId]
  const engine = useVizEngine(steps)

  return {
    ...engine,
    failureModes: FAILURE_MODES[vizId] ?? [],
  }
}

interface VizEngineProps {
  moduleId: string
  handle: VizEngineHandle
}

export function VizEngine({ moduleId, handle }: VizEngineProps) {
  const { state } = handle
  const vizId = (moduleId as VizId) in VIZ_CONFIGS ? (moduleId as VizId) : "http-journey"

  switch (vizId) {
    case "http-journey":
      return (
        <HttpJourney
          steps={state.steps}
          stepIndex={state.stepIndex}
          failureMode={state.failureMode}
        />
      )
    case "concurrency":
      return (
        <ConcurrencyViz
          steps={state.steps}
          stepIndex={state.stepIndex}
          failureMode={state.failureMode}
        />
      )
    case "git-pr":
      return (
        <GitAreasViz
          steps={state.steps}
          stepIndex={state.stepIndex}
          failureMode={state.failureMode}
        />
      )
    default:
      return (
        <HttpJourney
          steps={state.steps}
          stepIndex={state.stepIndex}
          failureMode={state.failureMode}
        />
      )
  }
}
