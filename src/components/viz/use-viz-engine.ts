"use client"

import { useReducer, useCallback, useRef, useEffect } from "react"

export interface VizStep {
  id: string
  label: string
  description?: string
  icon?: string
  duration: number // ms for animation
  status: "idle" | "active" | "done" | "error"
}

export interface VizState {
  stepIndex: number
  totalSteps: number
  steps: VizStep[]
  isPlaying: boolean
  speed: number
  failureMode: string | null
  progress: number // 0-100
}

export type VizAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_STEP"; index: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "SET_FAILURE_MODE"; mode: string | null }
  | { type: "TICK" }
  | { type: "SET_STEP_STATUS"; stepId: string; status: VizStep["status"] }

function calculateProgress(stepIndex: number, totalSteps: number): number {
  if (totalSteps <= 1) return stepIndex >= 1 ? 100 : 0
  return Math.round((stepIndex / (totalSteps - 1)) * 100)
}

function updateStepStatuses(steps: VizStep[], currentIndex: number): VizStep[] {
  return steps.map((step, i) => ({
    ...step,
    status: i < currentIndex ? "done" : i === currentIndex ? "active" : "idle",
  }))
}

export function vizReducer(state: VizState, action: VizAction): VizState {
  switch (action.type) {
    case "PLAY":
      return { ...state, isPlaying: true }

    case "PAUSE":
      return { ...state, isPlaying: false }

    case "RESET":
      return {
        ...state,
        stepIndex: 0,
        isPlaying: false,
        progress: 0,
        failureMode: null,
        steps: updateStepStatuses(state.steps, 0),
      }

    case "NEXT_STEP": {
      const next = Math.min(state.stepIndex + 1, state.totalSteps - 1)
      const isLast = next === state.totalSteps - 1
      return {
        ...state,
        stepIndex: next,
        isPlaying: isLast ? false : state.isPlaying,
        progress: calculateProgress(next, state.totalSteps),
        steps: updateStepStatuses(state.steps, next),
      }
    }

    case "PREV_STEP": {
      const prev = Math.max(state.stepIndex - 1, 0)
      return {
        ...state,
        stepIndex: prev,
        isPlaying: false,
        progress: calculateProgress(prev, state.totalSteps),
        steps: updateStepStatuses(state.steps, prev),
      }
    }

    case "SET_STEP": {
      const idx = Math.max(0, Math.min(action.index, state.totalSteps - 1))
      return {
        ...state,
        stepIndex: idx,
        isPlaying: false,
        progress: calculateProgress(idx, state.totalSteps),
        steps: updateStepStatuses(state.steps, idx),
      }
    }

    case "SET_SPEED":
      return { ...state, speed: action.speed }

    case "SET_FAILURE_MODE":
      return { ...state, failureMode: action.mode }

    case "TICK": {
      if (!state.isPlaying) return state
      if (state.stepIndex >= state.totalSteps - 1) {
        return { ...state, isPlaying: false }
      }
      const next = state.stepIndex + 1
      return {
        ...state,
        stepIndex: next,
        progress: calculateProgress(next, state.totalSteps),
        steps: updateStepStatuses(state.steps, next),
        isPlaying: next < state.totalSteps - 1,
      }
    }

    case "SET_STEP_STATUS":
      return {
        ...state,
        steps: state.steps.map((s) =>
          s.id === action.stepId ? { ...s, status: action.status } : s
        ),
      }

    default:
      return state
  }
}

export function useVizEngine(initialSteps: VizStep[]) {
  const [state, dispatch] = useReducer(vizReducer, {
    stepIndex: 0,
    totalSteps: initialSteps.length,
    steps: initialSteps.map((s, i) => ({
      ...s,
      status: (i === 0 ? "active" : "idle") as VizStep["status"],
    })),
    isPlaying: false,
    speed: 1,
    failureMode: null,
    progress: 0,
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (state.isPlaying && state.stepIndex < state.totalSteps - 1) {
      const currentStep = state.steps[state.stepIndex]
      const delay = (currentStep?.duration ?? 1500) / state.speed

      timerRef.current = setTimeout(() => {
        dispatch({ type: "TICK" })
      }, delay)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.isPlaying, state.stepIndex, state.speed, state.steps, state.totalSteps])

  const play = useCallback(() => dispatch({ type: "PLAY" }), [])
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), [])
  const reset = useCallback(() => dispatch({ type: "RESET" }), [])
  const nextStep = useCallback(() => dispatch({ type: "NEXT_STEP" }), [])
  const prevStep = useCallback(() => dispatch({ type: "PREV_STEP" }), [])
  const setStep = useCallback((i: number) => dispatch({ type: "SET_STEP", index: i }), [])
  const setSpeed = useCallback((s: number) => dispatch({ type: "SET_SPEED", speed: s }), [])
  const setFailureMode = useCallback(
    (m: string | null) => dispatch({ type: "SET_FAILURE_MODE", mode: m }),
    []
  )
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      dispatch({ type: "PAUSE" })
    } else {
      // If at end, reset first
      if (state.stepIndex >= state.totalSteps - 1) {
        dispatch({ type: "RESET" })
        // Small delay so reset applies before play
        setTimeout(() => dispatch({ type: "PLAY" }), 50)
      } else {
        dispatch({ type: "PLAY" })
      }
    }
  }, [state.isPlaying, state.stepIndex, state.totalSteps])

  return {
    state,
    dispatch,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    setStep,
    setSpeed,
    setFailureMode,
    togglePlay,
  }
}
