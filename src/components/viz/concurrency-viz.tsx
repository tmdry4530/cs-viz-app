"use client"

import { useMemo } from "react"
import {
  Cpu,
  Database,
  Layers,
  Lock,
  Unlock,
  ArrowDownUp,
  AlertTriangle,
  Zap,
  RotateCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VizStep } from "./use-viz-engine"

const CONCURRENCY_STEPS: VizStep[] = [
  { id: "task-arrive", label: "Task 도착", description: "새 작업이 큐에 진입", duration: 1200, status: "idle" },
  { id: "queue-enter", label: "큐 진입", description: "콜백 큐에 등록", duration: 1000, status: "idle" },
  { id: "event-loop-pick", label: "이벤트루프", description: "루프가 다음 태스크 선택", duration: 1500, status: "idle" },
  { id: "callstack-push", label: "콜스택 Push", description: "실행 컨텍스트 생성", duration: 1200, status: "idle" },
  { id: "execute", label: "실행 중", description: "함수 본문 실행", duration: 2000, status: "idle" },
  { id: "microtask", label: "마이크로태스크", description: "Promise.then 처리", duration: 1500, status: "idle" },
  { id: "callstack-pop", label: "콜스택 Pop", description: "실행 완료, 컨텍스트 제거", duration: 1000, status: "idle" },
  { id: "thread-spawn", label: "스레드 생성", description: "새 스레드 할당 (멀티스레드)", duration: 1500, status: "idle" },
  { id: "lock-acquire", label: "락 획득", description: "공유 자원 접근 잠금", duration: 1800, status: "idle" },
  { id: "critical-section", label: "임계 영역", description: "공유 데이터 읽기/쓰기", duration: 2000, status: "idle" },
  { id: "lock-release", label: "락 해제", description: "잠금 해제, 다른 스레드 접근 허용", duration: 1200, status: "idle" },
  { id: "deadlock", label: "데드락 감지", description: "순환 대기 발생!", duration: 2500, status: "idle" },
]

interface TaskBlock {
  id: string
  label: string
  color: string
  position: "queue" | "stack" | "microtask" | "running" | "done" | "thread" | "locked" | "deadlocked"
}

interface ConcurrencyVizProps {
  steps: VizStep[]
  stepIndex: number
  failureMode: string | null
}

export { CONCURRENCY_STEPS }

export function ConcurrencyViz({ steps, stepIndex, failureMode }: ConcurrencyVizProps) {
  const isEventLoopPhase = stepIndex <= 6
  const isThreadPhase = stepIndex > 6

  const tasks = useMemo<TaskBlock[]>(() => {
    const t: TaskBlock[] = []

    if (stepIndex >= 0) {
      t.push({
        id: "t1",
        label: "setTimeout(fn, 0)",
        color: "bg-blue-500/20 border-blue-500/50 text-blue-300",
        position:
          stepIndex === 0 ? "queue" :
          stepIndex === 1 ? "queue" :
          stepIndex === 2 ? "queue" :
          stepIndex <= 4 ? "stack" :
          stepIndex === 5 ? "running" : "done",
      })
    }
    if (stepIndex >= 1) {
      t.push({
        id: "t2",
        label: "fetch().then()",
        color: "bg-purple-500/20 border-purple-500/50 text-purple-300",
        position:
          stepIndex <= 4 ? "microtask" :
          stepIndex === 5 ? "stack" : "done",
      })
    }
    if (stepIndex >= 2) {
      t.push({
        id: "t3",
        label: "onClick()",
        color: "bg-amber-500/20 border-amber-500/50 text-amber-300",
        position: stepIndex <= 5 ? "queue" : "done",
      })
    }

    // Thread phase tasks
    if (isThreadPhase) {
      const threadStatus = failureMode === "deadlock" && stepIndex >= 11 ? "deadlocked" : "thread"
      t.push({
        id: "th1",
        label: "Thread-1",
        color: "bg-cyan-500/20 border-cyan-500/50 text-cyan-300",
        position: stepIndex >= 9 ? (stepIndex >= 10 ? "locked" : threadStatus) : "thread",
      })
      t.push({
        id: "th2",
        label: "Thread-2",
        color: "bg-rose-500/20 border-rose-500/50 text-rose-300",
        position: stepIndex >= 9 ? (failureMode === "deadlock" ? "deadlocked" : threadStatus) : "thread",
      })
    }

    return t
  }, [stepIndex, isThreadPhase, failureMode])

  const queueTasks = tasks.filter((t) => t.position === "queue")
  const stackTasks = tasks.filter((t) => t.position === "stack")
  const microTasks = tasks.filter((t) => t.position === "microtask")
  const doneTasks = tasks.filter((t) => t.position === "done")
  const threadTasks = tasks.filter((t) => t.position === "thread" || t.position === "locked" || t.position === "deadlocked")

  return (
    <div className="flex h-full flex-col gap-4">
      {/* View Mode Indicator */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "text-xs transition-all",
            isEventLoopPhase ? "border-primary text-primary" : "border-border/50 text-muted-foreground"
          )}
        >
          <RotateCw className="mr-1 h-3 w-3" />
          Event Loop
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "text-xs transition-all",
            isThreadPhase ? "border-primary text-primary" : "border-border/50 text-muted-foreground"
          )}
        >
          <Layers className="mr-1 h-3 w-3" />
          Thread Pool
        </Badge>
        {failureMode === "deadlock" && stepIndex >= 11 && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Deadlock!
          </Badge>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 gap-4 flex-1 lg:grid-cols-2">
        {/* Event Loop Side */}
        <div className={cn("flex flex-col gap-3", !isEventLoopPhase && "opacity-40")}>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Single Thread (Event Loop)
          </div>

          {/* Call Stack */}
          <div className="rounded-lg border border-border/50 bg-card/50 p-3 min-h-[80px]">
            <div className="mb-2 flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">Call Stack</span>
            </div>
            <div className="flex flex-col gap-1">
              {stackTasks.length > 0 ? (
                stackTasks.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded border px-2 py-1 text-xs font-mono transition-all duration-500 animate-in slide-in-from-bottom-2",
                      t.color
                    )}
                  >
                    {t.label}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-muted-foreground/40 italic">empty</div>
              )}
            </div>
          </div>

          {/* Event Loop Arrow */}
          {isEventLoopPhase && stepIndex >= 2 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-1 text-primary animate-pulse">
                <ArrowDownUp className="h-4 w-4" />
                <span className="text-[10px] font-medium">Event Loop</span>
              </div>
            </div>
          )}

          {/* Queues */}
          <div className="grid grid-cols-2 gap-2">
            {/* Callback Queue */}
            <div className="rounded-lg border border-border/50 bg-card/50 p-2.5">
              <div className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                Callback Queue
              </div>
              <div className="flex flex-col gap-1">
                {queueTasks.length > 0 ? (
                  queueTasks.map((t) => (
                    <div
                      key={t.id}
                      className={cn("rounded border px-2 py-0.5 text-[10px] font-mono", t.color)}
                    >
                      {t.label}
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-muted-foreground/40 italic">empty</div>
                )}
              </div>
            </div>

            {/* Microtask Queue */}
            <div className="rounded-lg border border-border/50 bg-card/50 p-2.5">
              <div className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                Microtask Queue
              </div>
              <div className="flex flex-col gap-1">
                {microTasks.length > 0 ? (
                  microTasks.map((t) => (
                    <div
                      key={t.id}
                      className={cn("rounded border px-2 py-0.5 text-[10px] font-mono", t.color)}
                    >
                      {t.label}
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-muted-foreground/40 italic">empty</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thread Pool Side */}
        <div className={cn("flex flex-col gap-3", !isThreadPhase && "opacity-40")}>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Multi-Thread (Thread Pool)
          </div>

          {/* Threads */}
          <div className="rounded-lg border border-border/50 bg-card/50 p-3 min-h-[80px]">
            <div className="mb-2 flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">Threads</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {threadTasks.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-center gap-2 rounded border px-2 py-1 text-xs font-mono transition-all duration-500",
                    t.position === "deadlocked"
                      ? "bg-destructive/20 border-destructive/50 text-destructive animate-pulse"
                      : t.position === "locked"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : t.color
                  )}
                >
                  {t.position === "locked" && <Lock className="h-3 w-3" />}
                  {t.position === "deadlocked" && <AlertTriangle className="h-3 w-3" />}
                  {t.label}
                  {t.position === "locked" && <span className="text-[10px] opacity-70">holding lock</span>}
                </div>
              ))}
              {!isThreadPhase && (
                <div className="text-[10px] text-muted-foreground/40 italic">waiting...</div>
              )}
            </div>
          </div>

          {/* Shared Memory */}
          <div className="rounded-lg border border-border/50 bg-card/50 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">Shared Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "rounded border px-2 py-1 text-[10px] font-mono transition-all",
                stepIndex >= 9 ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-card border-border/30 text-muted-foreground/50"
              )}>
                {stepIndex >= 9 ? (
                  <span className="flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> counter = {stepIndex >= 10 ? 42 : "?"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Unlock className="h-2.5 w-2.5" /> counter = 0
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deadlock conditions */}
          {failureMode === "deadlock" && stepIndex >= 11 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="mb-1.5 text-[10px] font-medium text-destructive uppercase">
                Deadlock 조건 (4가지)
              </div>
              <div className="grid grid-cols-2 gap-1">
                {["상호배제", "점유대기", "비선점", "순환대기"].map((c) => (
                  <div key={c} className="flex items-center gap-1 text-[10px] text-destructive/80">
                    <Zap className="h-2.5 w-2.5" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      {doneTasks.length > 0 && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
          <span>완료:</span>
          {doneTasks.map((t) => (
            <span key={t.id} className="font-mono">{t.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

