"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UpgradePromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
}

export function UpgradePrompt({
  open,
  onOpenChange,
  feature,
}: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pro 구독이 필요합니다</DialogTitle>
          <DialogDescription>
            {feature
              ? `"${feature}" 기능은 Pro 구독자만 이용할 수 있습니다.`
              : "이 기능은 Pro 구독자만 이용할 수 있습니다."}
            {" "}Pro로 업그레이드하고 모든 기능을 이용해 보세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500">&#10003;</span>
            AI 코치 - 설명력 피드백 및 꼬리질문
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500">&#10003;</span>
            스터디 룸 - 실시간 협업 학습
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500">&#10003;</span>
            월간 리포트 - 학습 분석 리포트
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500">&#10003;</span>
            고급 진단 - 심화 약점 분석
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500">&#10003;</span>
            무제한 학습 세션
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            나중에
          </Button>
          <Button asChild>
            <Link href="/pricing">Pro 업그레이드</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
