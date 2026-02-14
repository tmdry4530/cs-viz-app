"use client"

import { useId, useMemo } from "react"
import {
  Globe,
  Server,
  Shield,
  Waypoints,
  AppWindow,
  Database,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VizStep } from "./use-viz-engine"

const HTTP_STEPS: VizStep[] = [
  { id: "client", label: "Client", description: "브라우저가 요청 생성", duration: 1200, status: "idle" },
  { id: "dns", label: "DNS", description: "도메인 → IP 주소 변환", duration: 1500, status: "idle" },
  { id: "tcp", label: "TCP", description: "3-way handshake 연결", duration: 1800, status: "idle" },
  { id: "tls", label: "TLS", description: "암호화 핸드셰이크", duration: 2000, status: "idle" },
  { id: "http", label: "HTTP", description: "GET /api/data HTTP/1.1", duration: 1200, status: "idle" },
  { id: "lb", label: "Load Balancer", description: "라운드로빈 분배", duration: 1000, status: "idle" },
  { id: "app", label: "App Server", description: "비즈니스 로직 처리", duration: 2200, status: "idle" },
  { id: "db", label: "Database", description: "SELECT * FROM users", duration: 1800, status: "idle" },
  { id: "response", label: "Response", description: "200 OK + JSON body", duration: 1200, status: "idle" },
  { id: "render", label: "Render", description: "브라우저 렌더링 완료", duration: 1000, status: "idle" },
]

const STEP_ICONS: Record<string, React.ElementType> = {
  client: Globe,
  dns: Globe,
  tcp: Waypoints,
  tls: Shield,
  http: ArrowRight,
  lb: Waypoints,
  app: AppWindow,
  db: Database,
  response: ArrowRight,
  render: Globe,
}

const FAILURE_LATENCIES: Record<string, Record<string, { latency: string; error?: string }>> = {
  timeout: {
    dns: { latency: "5000ms", error: "DNS Timeout" },
    tcp: { latency: "30000ms", error: "Connection Timeout" },
  },
  "502": {
    lb: { latency: "120ms", error: "502 Bad Gateway" },
    app: { latency: "-", error: "Server Down" },
  },
  "retry-storm": {
    lb: { latency: "80ms" },
    app: { latency: "4500ms", error: "Overloaded" },
  },
}

const NORMAL_LATENCIES: Record<string, string> = {
  client: "0ms",
  dns: "20ms",
  tcp: "35ms",
  tls: "45ms",
  http: "2ms",
  lb: "5ms",
  app: "120ms",
  db: "45ms",
  response: "3ms",
  render: "80ms",
}

interface HttpJourneyProps {
  steps: VizStep[]
  stepIndex: number
  failureMode: string | null
}

export { HTTP_STEPS }

export function HttpJourney({ steps, stepIndex, failureMode }: HttpJourneyProps) {
  const reqId = useId()
  const logEntries = useMemo(() => {
    return steps.slice(0, stepIndex + 1).map((step) => {
      const failInfo = failureMode ? FAILURE_LATENCIES[failureMode]?.[step.id] : null
      const latency = failInfo?.latency ?? NORMAL_LATENCIES[step.id] ?? "0ms"
      const error = failInfo?.error ?? null
      const isError = step.status === "error" || !!error

      return { ...step, latency, error, isError }
    })
  }, [steps, stepIndex, failureMode])

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Flow Diagram */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[700px] px-2 py-4">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[step.id] ?? Server
            const failInfo = failureMode ? FAILURE_LATENCIES[failureMode]?.[step.id] : null
            const hasError = !!failInfo?.error && i <= stepIndex
            const isActive = step.status === "active"
            const isDone = step.status === "done"

            return (
              <div key={step.id} className="flex items-center">
                {/* Node */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-500",
                      isActive && !hasError && "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-110",
                      isDone && !hasError && "border-primary/50 bg-primary/5",
                      hasError && "border-destructive bg-destructive/10 shadow-lg shadow-destructive/20",
                      !isActive && !isDone && !hasError && "border-border/50 bg-card"
                    )}
                  >
                    {isActive && !hasError && (
                      <div className="absolute inset-0 rounded-xl animate-ping bg-primary/10" />
                    )}
                    {hasError ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-300",
                          isActive && "text-primary",
                          isDone && "text-primary/70",
                          !isActive && !isDone && "text-muted-foreground/50"
                        )}
                      />
                    )}

                    {/* Status indicator */}
                    {isDone && !hasError && (
                      <CheckCircle2 className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full" />
                    )}
                    {isActive && !hasError && (
                      <Loader2 className="absolute -bottom-1 -right-1 h-4 w-4 text-primary animate-spin bg-background rounded-full" />
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium text-center max-w-[56px] leading-tight transition-colors",
                      isActive && "text-foreground",
                      isDone && "text-muted-foreground",
                      !isActive && !isDone && "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="mx-0.5 flex items-center">
                    <div
                      className={cn(
                        "h-0.5 w-6 transition-all duration-500",
                        i < stepIndex ? "bg-primary/50" : "bg-border/30"
                      )}
                    />
                    <ArrowRight
                      className={cn(
                        "h-3 w-3 -ml-1 transition-colors duration-500",
                        i < stepIndex ? "text-primary/50" : "text-border/30"
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Log Panel */}
      <div className="rounded-lg border border-border/50 bg-black/80 p-3 font-mono text-xs">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-muted-foreground">Request Log</span>
          <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground">
            req-{reqId.replace(/:/g, '').slice(0, 6)}
          </Badge>
          {failureMode && (
            <Badge variant="destructive" className="text-[10px]">
              <AlertTriangle className="mr-1 h-2.5 w-2.5" />
              {failureMode}
            </Badge>
          )}
        </div>

        <div className="max-h-[120px] space-y-0.5 overflow-y-auto">
          {logEntries.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-2">
              <span className="text-muted-foreground/50 w-4 text-right">{i + 1}</span>
              <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
              <span className={cn("w-14", entry.isError ? "text-destructive" : "text-green-400")}>
                {entry.latency}
              </span>
              <span className={cn(entry.isError ? "text-destructive" : "text-foreground/80")}>
                {entry.label}
              </span>
              {entry.error && (
                <span className="text-destructive/80">— {entry.error}</span>
              )}
              {entry.status === "active" && !entry.isError && (
                <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
              )}
            </div>
          ))}

          {logEntries.length === 0 && (
            <div className="text-muted-foreground/50">재생 버튼을 눌러 시작하세요...</div>
          )}
        </div>
      </div>
    </div>
  )
}
