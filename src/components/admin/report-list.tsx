"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Shield, Eye, EyeOff, AlertTriangle, RotateCcw } from "lucide-react"

interface Report {
  id: string
  targetType: string
  targetId: string
  reason: string
  status: string
  createdAt: string
  reporter: string
  actionCount: number
}

const reasonLabels: Record<string, string> = {
  spam: "스팸",
  harassment: "괴롭힘",
  inappropriate: "부적절한 내용",
  misinformation: "허위 정보",
  other: "기타",
}

export function AdminReportList({ reports: initialReports }: { reports: Report[] }) {
  const [reports, setReports] = useState(initialReports)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAction = async (reportId: string, action: "dismiss" | "hide" | "warn" | "restore") => {
    setProcessing(reportId)

    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      })

      if (!res.ok) throw new Error()

      setReports((prev) => prev.filter((r) => r.id !== reportId))

      const actionLabels = { dismiss: "무시", hide: "숨김", warn: "경고", restore: "복원" }
      toast.success(`신고를 ${actionLabels[action]} 처리했습니다.`)
    } catch {
      toast.error("처리 중 오류가 발생했습니다.")
    } finally {
      setProcessing(null)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          처리할 신고가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        대기 중인 신고: {reports.length}건
      </p>

      {reports.map((report) => {
        const timeAgo = (() => {
          try {
            return formatDistanceToNow(new Date(report.createdAt), {
              addSuffix: true,
              locale: ko,
            })
          } catch {
            return ""
          }
        })()

        return (
          <Card key={report.id} className="border-border/50">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <Badge variant="outline" className="text-xs">
                    {report.targetType === "post" ? "게시글" : "댓글"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {reasonLabels[report.reason] || report.reason}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo}
                </span>
              </div>

              <div className="mb-4 text-sm text-muted-foreground">
                <p>
                  신고자: <span className="text-foreground">{report.reporter}</span>
                </p>
                <p className="mt-1">
                  대상 ID: <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{report.targetId}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  disabled={processing === report.id}
                  onClick={() => handleAction(report.id, "dismiss")}
                >
                  <Eye className="h-3 w-3" />
                  무시
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-yellow-600"
                  disabled={processing === report.id}
                  onClick={() => handleAction(report.id, "hide")}
                >
                  <EyeOff className="h-3 w-3" />
                  콘텐츠 숨김
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-destructive"
                  disabled={processing === report.id}
                  onClick={() => handleAction(report.id, "warn")}
                >
                  <AlertTriangle className="h-3 w-3" />
                  경고
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-green-600"
                  disabled={processing === report.id}
                  onClick={() => handleAction(report.id, "restore")}
                >
                  <RotateCcw className="h-3 w-3" />
                  복원
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
