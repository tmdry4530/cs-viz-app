"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Save } from "lucide-react"

interface ModuleData {
  id: string
  slug: string
  title: string
  subtitle: string
  outcomes: string[]
  difficulty: string
  time: string
  tag: string
  color: string
  vizConfig: unknown
}

export function ModuleEditor({ module: initial }: { module: ModuleData }) {
  const [form, setForm] = useState({
    title: initial.title,
    subtitle: initial.subtitle,
    outcomes: initial.outcomes.join("\n"),
    difficulty: initial.difficulty,
    time: initial.time,
    tag: initial.tag,
    color: initial.color,
    changelog: "",
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/modules/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle,
          outcomes: form.outcomes.split("\n").filter((s) => s.trim()),
          difficulty: form.difficulty,
          time: form.time,
          tag: form.tag,
          color: form.color,
          changelog: form.changelog || undefined,
        }),
      })

      if (!res.ok) throw new Error()

      toast.success("모듈이 저장되었습니다.")
      setForm((prev) => ({ ...prev, changelog: "" }))
    } catch {
      toast.error("저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>모듈 정보 편집</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (읽기 전용)</Label>
              <Input id="slug" value={initial.slug} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="subtitle">부제목</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subtitle: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="outcomes">학습 목표 (줄바꿈으로 구분)</Label>
            <textarea
              id="outcomes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.outcomes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, outcomes: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="difficulty">난이도</Label>
              <Input
                id="difficulty"
                value={form.difficulty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, difficulty: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="time">소요 시간</Label>
              <Input
                id="time"
                value={form.time}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, time: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="tag">태그</Label>
              <Input
                id="tag"
                value={form.tag}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tag: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="color">색상</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
                <div
                  className="h-9 w-9 shrink-0 rounded-md border"
                  style={{ backgroundColor: form.color }}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="changelog">변경 사항 메모 (선택)</Label>
            <Input
              id="changelog"
              placeholder="이번 수정 내용을 간단히 기록하세요"
              value={form.changelog}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, changelog: e.target.value }))
              }
            />
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "저장 중..." : "저장 (버전 자동 생성)"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
