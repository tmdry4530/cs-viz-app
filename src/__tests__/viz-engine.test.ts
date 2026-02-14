import { vizReducer, type VizState, type VizStep } from "@/components/viz/use-viz-engine"

const mockSteps: VizStep[] = [
  { id: "step1", label: "Step 1", duration: 1000, status: "active" },
  { id: "step2", label: "Step 2", duration: 1000, status: "idle" },
  { id: "step3", label: "Step 3", duration: 1000, status: "idle" },
]

function makeState(overrides: Partial<VizState> = {}): VizState {
  return {
    stepIndex: 0,
    totalSteps: 3,
    steps: [...mockSteps],
    isPlaying: false,
    speed: 1,
    failureMode: null,
    progress: 0,
    ...overrides,
  }
}

describe("vizReducer", () => {
  it("PLAY sets isPlaying to true", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "PLAY" })
    expect(next.isPlaying).toBe(true)
  })

  it("PAUSE sets isPlaying to false", () => {
    const state = makeState({ isPlaying: true })
    const next = vizReducer(state, { type: "PAUSE" })
    expect(next.isPlaying).toBe(false)
  })

  it("RESET returns to step 0 and stops playing", () => {
    const state = makeState({ stepIndex: 2, isPlaying: true, progress: 100 })
    const next = vizReducer(state, { type: "RESET" })
    expect(next.stepIndex).toBe(0)
    expect(next.isPlaying).toBe(false)
    expect(next.progress).toBe(0)
    expect(next.failureMode).toBeNull()
  })

  it("NEXT_STEP advances stepIndex", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "NEXT_STEP" })
    expect(next.stepIndex).toBe(1)
    expect(next.progress).toBe(50)
  })

  it("NEXT_STEP does not exceed totalSteps - 1", () => {
    const state = makeState({ stepIndex: 2 })
    const next = vizReducer(state, { type: "NEXT_STEP" })
    expect(next.stepIndex).toBe(2)
  })

  it("NEXT_STEP stops playing at last step", () => {
    const state = makeState({ stepIndex: 1, isPlaying: true })
    const next = vizReducer(state, { type: "NEXT_STEP" })
    expect(next.stepIndex).toBe(2)
    expect(next.isPlaying).toBe(false)
  })

  it("PREV_STEP decreases stepIndex", () => {
    const state = makeState({ stepIndex: 2 })
    const next = vizReducer(state, { type: "PREV_STEP" })
    expect(next.stepIndex).toBe(1)
    expect(next.isPlaying).toBe(false)
  })

  it("PREV_STEP does not go below 0", () => {
    const state = makeState({ stepIndex: 0 })
    const next = vizReducer(state, { type: "PREV_STEP" })
    expect(next.stepIndex).toBe(0)
  })

  it("SET_STEP sets specific index", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "SET_STEP", index: 2 })
    expect(next.stepIndex).toBe(2)
    expect(next.progress).toBe(100)
    expect(next.isPlaying).toBe(false)
  })

  it("SET_STEP clamps to valid range", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "SET_STEP", index: 99 })
    expect(next.stepIndex).toBe(2)

    const next2 = vizReducer(state, { type: "SET_STEP", index: -5 })
    expect(next2.stepIndex).toBe(0)
  })

  it("SET_SPEED changes speed", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "SET_SPEED", speed: 2 })
    expect(next.speed).toBe(2)
  })

  it("SET_FAILURE_MODE toggles failure mode", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "SET_FAILURE_MODE", mode: "timeout" })
    expect(next.failureMode).toBe("timeout")

    const next2 = vizReducer(next, { type: "SET_FAILURE_MODE", mode: null })
    expect(next2.failureMode).toBeNull()
  })

  it("TICK advances when playing", () => {
    const state = makeState({ isPlaying: true })
    const next = vizReducer(state, { type: "TICK" })
    expect(next.stepIndex).toBe(1)
  })

  it("TICK does nothing when paused", () => {
    const state = makeState({ isPlaying: false })
    const next = vizReducer(state, { type: "TICK" })
    expect(next.stepIndex).toBe(0)
  })

  it("TICK stops playing at last step", () => {
    const state = makeState({ stepIndex: 1, isPlaying: true })
    const next = vizReducer(state, { type: "TICK" })
    expect(next.stepIndex).toBe(2)
    expect(next.isPlaying).toBe(false)
  })

  it("SET_STEP_STATUS updates a specific step status", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "SET_STEP_STATUS", stepId: "step2", status: "error" })
    expect(next.steps[1].status).toBe("error")
    expect(next.steps[0].status).toBe("active") // unchanged
  })

  it("step statuses update correctly on NEXT_STEP", () => {
    const state = makeState()
    const next = vizReducer(state, { type: "NEXT_STEP" })
    expect(next.steps[0].status).toBe("done")
    expect(next.steps[1].status).toBe("active")
    expect(next.steps[2].status).toBe("idle")
  })
})
