"use client"

import { useMemo } from "react"
import {
  FileText,
  FolderOpen,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Plus,
  Check,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VizStep } from "./use-viz-engine"

const GIT_STEPS: VizStep[] = [
  { id: "init", label: "git init", description: "저장소 초기화", duration: 1200, status: "idle" },
  { id: "edit", label: "파일 수정", description: "Working Tree에서 편집", duration: 1500, status: "idle" },
  { id: "add", label: "git add", description: "Index(Staging)에 등록", duration: 1800, status: "idle" },
  { id: "commit", label: "git commit", description: "스냅샷 → Commit 생성", duration: 2000, status: "idle" },
  { id: "branch", label: "git branch", description: "feature 브랜치 생성", duration: 1200, status: "idle" },
  { id: "edit2", label: "브랜치 수정", description: "feature에서 작업", duration: 1500, status: "idle" },
  { id: "commit2", label: "git commit", description: "feature에 커밋 추가", duration: 1800, status: "idle" },
  { id: "pr-create", label: "PR 생성", description: "Pull Request 열기", duration: 1500, status: "idle" },
  { id: "pr-review", label: "코드 리뷰", description: "리뷰어 피드백", duration: 2000, status: "idle" },
  { id: "pr-fix", label: "수정 반영", description: "리뷰 반영 커밋", duration: 1800, status: "idle" },
  { id: "merge", label: "Merge", description: "main에 병합", duration: 2000, status: "idle" },
  { id: "conflict", label: "충돌 해결", description: "merge conflict 해결", duration: 2500, status: "idle" },
]

interface FileCard {
  name: string
  area: "working" | "staging" | "committed" | "branch"
  status: "new" | "modified" | "staged" | "committed" | "conflict"
}

interface GitAreasVizProps {
  steps: VizStep[]
  stepIndex: number
  failureMode: string | null
}

export { GIT_STEPS }

export function GitAreasViz({ steps, stepIndex, failureMode }: GitAreasVizProps) {
  const files = useMemo<FileCard[]>(() => {
    const f: FileCard[] = []
    if (stepIndex >= 1) {
      f.push({
        name: "index.ts",
        area: stepIndex >= 3 ? "committed" : stepIndex >= 2 ? "staging" : "working",
        status: stepIndex >= 3 ? "committed" : stepIndex >= 2 ? "staged" : "modified",
      })
    }
    if (stepIndex >= 1) {
      f.push({
        name: "utils.ts",
        area: stepIndex >= 3 ? "committed" : stepIndex >= 2 ? "staging" : "working",
        status: stepIndex >= 3 ? "committed" : stepIndex >= 2 ? "staged" : "new",
      })
    }
    if (stepIndex >= 5) {
      f.push({
        name: "feature.ts",
        area: stepIndex >= 6 ? "committed" : stepIndex >= 5 ? "working" : "branch",
        status: stepIndex >= 6 ? "committed" : "modified",
      })
    }
    if (stepIndex >= 11 && failureMode === "conflict") {
      f.push({
        name: "shared.ts",
        area: "working",
        status: "conflict",
      })
    }
    return f
  }, [stepIndex, failureMode])

  const branches = useMemo(() => {
    const b: { name: string; commits: number; active: boolean; merged: boolean }[] = [
      { name: "main", commits: stepIndex >= 3 ? (stepIndex >= 10 ? 4 : 2) : 1, active: stepIndex < 5, merged: false },
    ]
    if (stepIndex >= 4) {
      b.push({
        name: "feature/add-auth",
        commits: stepIndex >= 6 ? (stepIndex >= 9 ? 3 : 2) : 1,
        active: stepIndex >= 5 && stepIndex < 10,
        merged: stepIndex >= 10,
      })
    }
    return b
  }, [stepIndex])

  const prStatus = useMemo(() => {
    if (stepIndex < 7) return null
    if (stepIndex === 7) return "open"
    if (stepIndex === 8) return "review"
    if (stepIndex === 9) return "changes-requested"
    return "merged"
  }, [stepIndex])

  const workingFiles = files.filter((f) => f.area === "working")
  const stagingFiles = files.filter((f) => f.area === "staging")
  const committedFiles = files.filter((f) => f.area === "committed")

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 3-Column Layout: Working Tree | Index | Commits */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {/* Working Tree */}
        <Area
          title="Working Tree"
          icon={FolderOpen}
          highlight={stepIndex === 1 || stepIndex === 5}
          files={workingFiles}
          stepIndex={stepIndex}
        />

        {/* Index (Staging) */}
        <Area
          title="Index (Staging)"
          icon={Plus}
          highlight={stepIndex === 2}
          files={stagingFiles}
          stepIndex={stepIndex}
        />

        {/* Commits */}
        <Area
          title="Commits"
          icon={Check}
          highlight={stepIndex === 3 || stepIndex === 6}
          files={committedFiles}
          stepIndex={stepIndex}
        />
      </div>

      {/* Movement Arrows */}
      {(stepIndex === 2 || stepIndex === 3) && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-primary text-xs animate-pulse">
            <ArrowRight className="h-4 w-4" />
            <span className="font-mono">
              {stepIndex === 2 ? "git add ." : "git commit -m 'init'"}
            </span>
          </div>
        </div>
      )}

      {/* Branch Visualization */}
      {stepIndex >= 4 && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <GitBranch className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Branches</span>
          </div>
          <div className="flex flex-col gap-2">
            {branches.map((b) => (
              <div key={b.name} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono transition-all",
                    b.active
                      ? "border-primary bg-primary/10 text-primary"
                      : b.merged
                        ? "border-primary/30 bg-primary/5 text-primary/50"
                        : "border-border/50 text-muted-foreground"
                  )}
                >
                  {b.merged ? (
                    <GitMerge className="h-3 w-3" />
                  ) : (
                    <GitBranch className="h-3 w-3" />
                  )}
                  {b.name}
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: b.commits }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border transition-all",
                        b.active || b.merged
                          ? "border-primary bg-primary/60"
                          : "border-border bg-border/60"
                      )}
                    />
                  ))}
                </div>
                {b.active && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    HEAD
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PR Flow */}
      {prStatus && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <GitPullRequest className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Pull Request</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: "open", label: "Open", icon: GitPullRequest },
              { key: "review", label: "Review", icon: MessageSquare },
              { key: "changes-requested", label: "Changes", icon: AlertCircle },
              { key: "merged", label: "Merged", icon: GitMerge },
            ].map((stage, i) => {
              const isPast =
                ["open", "review", "changes-requested", "merged"].indexOf(prStatus) >=
                ["open", "review", "changes-requested", "merged"].indexOf(stage.key)
              const isCurrent = prStatus === stage.key
              const StageIcon = stage.icon

              return (
                <div key={stage.key} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-all",
                      isCurrent && "border-primary bg-primary/10 text-primary scale-105",
                      isPast && !isCurrent && "border-primary/30 text-primary/60",
                      !isPast && "border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <StageIcon className="h-3 w-3" />
                    {stage.label}
                  </div>
                  {i < 3 && (
                    <ArrowRight
                      className={cn(
                        "mx-1 h-3 w-3",
                        isPast ? "text-primary/40" : "text-border/30"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Conflict Resolution */}
      {failureMode === "conflict" && stepIndex >= 11 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span className="text-[10px] font-medium uppercase">Merge Conflict</span>
          </div>
          <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed">
{`<<<<<<< HEAD
const config = { port: 3000 }
=======
const config = { port: 8080 }
>>>>>>> feature/add-auth`}
          </pre>
        </div>
      )}
    </div>
  )
}

function Area({
  title,
  icon: Icon,
  highlight,
  files,
  stepIndex,
}: {
  title: string
  icon: React.ElementType
  highlight: boolean
  files: FileCard[]
  stepIndex: number
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all duration-500 min-h-[120px]",
        highlight
          ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border/50 bg-card/50"
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Icon
          className={cn(
            "h-3 w-3",
            highlight ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span className="text-[10px] font-medium text-muted-foreground uppercase">{title}</span>
      </div>
      <div className="flex flex-col gap-1">
        {files.map((f) => (
          <div
            key={f.name}
            className={cn(
              "flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-mono transition-all duration-500 animate-in slide-in-from-left-2",
              f.status === "new" && "border-green-500/30 bg-green-500/10 text-green-300",
              f.status === "modified" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
              f.status === "staged" && "border-blue-500/30 bg-blue-500/10 text-blue-300",
              f.status === "committed" && "border-primary/30 bg-primary/10 text-primary/80",
              f.status === "conflict" && "border-destructive/30 bg-destructive/10 text-destructive animate-pulse"
            )}
          >
            <FileText className="h-2.5 w-2.5" />
            {f.name}
            {f.status === "conflict" && <AlertCircle className="h-2.5 w-2.5 ml-auto" />}
            {f.status === "committed" && <CheckCircle2 className="h-2.5 w-2.5 ml-auto" />}
          </div>
        ))}
        {files.length === 0 && (
          <div className="text-[10px] text-muted-foreground/40 italic">
            {stepIndex === 0 ? "empty" : "no files"}
          </div>
        )}
      </div>
    </div>
  )
}
