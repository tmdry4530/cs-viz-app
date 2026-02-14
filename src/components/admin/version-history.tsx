"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { RotateCcw, Clock } from "lucide-react"

interface Version {
  id: string
  version: number
  changelog: string | null
  createdBy: string
  createdAt: string
}

export function VersionHistory({
  moduleId,
  versions: initialVersions,
}: {
  moduleId: string
  versions: Version[]
}) {
  const [versions] = useState(initialVersions)
  const [reverting, setReverting] = useState<string | null>(null)

  const handleRevert = async (versionId: string, versionNum: number) => {
    if (!confirm(`버전 ${versionNum}으로 복원하시겠습니까? 현재 상태는 자동 백업됩니다.`)) {
      return
    }

    setReverting(versionId)

    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      })

      if (!res.ok) throw new Error()

      toast.success(`버전 ${versionNum}으로 복원되었습니다. 페이지를 새로고침합니다.`)
      window.location.reload()
    } catch {
      toast.error("복원 중 오류가 발생했습니다.")
    } finally {
      setReverting(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          버전 히스토리
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 버전 기록이 없습니다. 모듈을 수정하면 자동으로 버전이 생성됩니다.
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => {
              const timeAgo = (() => {
                try {
                  return formatDistanceToNow(new Date(v.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })
                } catch {
                  return ""
                }
              })()

              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      v{v.version}
                    </span>
                    <div>
                      <p className="text-sm text-foreground">
                        {v.changelog || `버전 ${v.version}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    disabled={reverting === v.id}
                    onClick={() => handleRevert(v.id, v.version)}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {reverting === v.id ? "복원 중..." : "복원"}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
