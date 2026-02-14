"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Share2 } from "lucide-react"

export function ReflectionComposer() {
  const [text, setText] = useState("")
  const [saved, setSaved] = useState(false)

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
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              1
            </span>
            <span className="text-xs text-muted-foreground">핵심 개념</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              2
            </span>
            <span className="text-xs text-muted-foreground">왜 중요한지</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              3
            </span>
            <span className="text-xs text-muted-foreground">
              실제로 어디서 터지는지
            </span>
          </div>
        </div>
      </div>

      <Textarea
        placeholder="여기에 3문장으로 정리해보세요..."
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setSaved(false)
        }}
        className="min-h-[120px] resize-none border-border/50 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setSaved(true)}
          disabled={text.trim().length === 0}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          저장
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={text.trim().length === 0}
        >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          공유에 포함
        </Button>
        {saved && (
          <span className="text-xs text-primary">저장됨</span>
        )}
      </div>
    </div>
  )
}
