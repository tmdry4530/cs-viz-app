"use client"

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { VizEngineHandle } from "@/components/viz/viz-engine"

interface VizControlsProps {
  handle: VizEngineHandle
}

export function VizControls({ handle }: VizControlsProps) {
  const { state, togglePlay, nextStep, prevStep, reset, setSpeed, setStep, setFailureMode, failureModes } = handle
  const speeds = [0.5, 1, 2]

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-card p-3">
      <Slider
        value={[state.progress]}
        onValueChange={([v]) => {
          const idx = Math.round((v / 100) * (state.totalSteps - 1))
          setStep(idx)
        }}
        max={100}
        step={1}
        className="w-full"
        aria-label="타임라인"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={prevStep}
            disabled={state.stepIndex === 0}
            aria-label="이전"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground"
            onClick={togglePlay}
            aria-label={state.isPlaying ? "일시정지" : "재생"}
          >
            {state.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={nextStep}
            disabled={state.stepIndex >= state.totalSteps - 1}
            aria-label="다음"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={reset}
            aria-label="리셋"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <span className="ml-2 text-[10px] font-mono text-muted-foreground">
            {state.stepIndex + 1}/{state.totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Failure Mode Toggle */}
          {failureModes.length > 0 && (
            <div className="flex items-center gap-1 rounded-md bg-secondary p-0.5">
              <button
                onClick={() => setFailureMode(null)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                  !state.failureMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                정상
              </button>
              {failureModes.map((fm) => (
                <button
                  key={fm.id}
                  onClick={() => setFailureMode(state.failureMode === fm.id ? null : fm.id)}
                  className={cn(
                    "flex items-center gap-0.5 rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                    state.failureMode === fm.id
                      ? "bg-destructive/20 text-destructive shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {fm.label}
                </button>
              ))}
            </div>
          )}

          {/* Speed Control */}
          <div className="flex items-center gap-1 rounded-md bg-secondary p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                  state.speed === s
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
