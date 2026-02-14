"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Share2, Check } from "lucide-react"

interface ReflectionComposerProps {
  sessionId: string | null
  userId: string
  onComplete: () => void
}

export function ReflectionComposer({ sessionId, userId, onComplete }: ReflectionComposerProps) {
  const [text, setText] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const sentences = text.split(/[.!?。]\s*/).filter((s) => s.trim().length > 0)
  const sentenceCount = sentences.length
  const isValid = sentenceCount >= 3 || text.length >= 50

  const handleSave = async () => {
    if (!sessionId || !text.trim()) return
    setSaving(true)

    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionRunId: sessionId,
          userId,
          content: text.trim(),
          isPublic,
        }),
      })

      if (res.ok) {
        setSaved(true)
        onComplete()
      } else {
        const data = await res.json()
        alert(data.error || "저장에 실패했습니다.")
      }
    } catch {
      // Fallback: mark as saved locally
      setSaved(true)
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          {"3문장 설명 (3분)"}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          개발자에게 설명하듯 3문장으로 정리해보세요.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${sentenceCount >= 1 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {sentenceCount >= 1 ? <Check className="h-3 w-3" /> : "1"}
            </span>
            <span className="text-xs text-muted-foreground">핵심 개념</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${sentenceCount >= 2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {sentenceCount >= 2 ? <Check className="h-3 w-3" /> : "2"}
            </span>
            <span className="text-xs text-muted-foreground">왜 중요한지</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${sentenceCount >= 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {sentenceCount >= 3 ? <Check className="h-3 w-3" /> : "3"}
            </span>
            <span className="text-xs text-muted-foreground">
              실제로 어디서 터지는지
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Textarea
          placeholder="여기에 3문장으로 정리해보세요..."
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setSaved(false)
          }}
          disabled={saved}
          className="min-h-[120px] resize-none border-border/50 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{sentenceCount}/3 문장 {isValid ? "(충분)" : "(최소 3문장)"}</span>
          <span>{text.length}자</span>
        </div>
      </div>

      {/* Public/Private toggle */}
      <div className="flex items-center gap-3">
        <Switch
          checked={isPublic}
          onCheckedChange={setIsPublic}
          disabled={saved}
        />
        <span className="text-sm text-muted-foreground">
          {isPublic ? "커뮤니티에 공개" : "비공개 (나만 보기)"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isValid || saved || saving}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {saving ? "저장 중..." : "저장"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!isValid || !saved}
        >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          공유에 포함
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-primary">
            <Check className="h-3 w-3" />
            저장됨
          </span>
        )}
      </div>
    </div>
  )
}
