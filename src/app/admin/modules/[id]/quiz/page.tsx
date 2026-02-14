"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, Save } from "lucide-react"

interface QuizQuestion {
  id: string
  type: string
  question: string
  options: string[] | null
  correctAnswer: string
  explanation: string
  stepJump: number | null
}

interface ModuleData {
  id: string
  title: string
  quizQuestions: QuizQuestion[]
}

export default function QuizManagementPage() {
  const params = useParams()
  const moduleId = params.id as string

  const [mod, setMod] = useState<ModuleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // New question form
  const [showForm, setShowForm] = useState(false)
  const [newQ, setNewQ] = useState({
    type: "multiple-choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    stepJump: "",
  })

  useEffect(() => {
    fetch(`/api/admin/modules/${moduleId}`)
      .then((res) => res.json())
      .then((data) => {
        setMod(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("모듈을 불러올 수 없습니다.")
        setLoading(false)
      })
  }, [moduleId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving("new")

    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          type: newQ.type,
          question: newQ.question,
          options:
            newQ.type === "multiple-choice"
              ? newQ.options.filter((o) => o.trim())
              : null,
          correctAnswer: newQ.correctAnswer,
          explanation: newQ.explanation,
          stepJump: newQ.stepJump ? parseInt(newQ.stepJump) : null,
        }),
      })

      if (!res.ok) throw new Error()

      const created = await res.json()
      setMod((prev) =>
        prev
          ? { ...prev, quizQuestions: [...prev.quizQuestions, created] }
          : prev
      )
      setNewQ({
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        stepJump: "",
      })
      setShowForm(false)
      toast.success("퀴즈 문항이 추가되었습니다.")
    } catch {
      toast.error("문항 추가 중 오류가 발생했습니다.")
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm("이 퀴즈 문항을 삭제하시겠습니까?")) return
    setSaving(questionId)

    try {
      const res = await fetch(`/api/admin/quiz/${questionId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      setMod((prev) =>
        prev
          ? {
              ...prev,
              quizQuestions: prev.quizQuestions.filter(
                (q) => q.id !== questionId
              ),
            }
          : prev
      )
      toast.success("문항이 삭제되었습니다.")
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    )
  }

  if (!mod) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
        <p className="text-sm text-muted-foreground">모듈을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const typeLabels: Record<string, string> = {
    "multiple-choice": "객관식",
    "true-false": "O/X",
    "fill-in-blank": "빈칸 채우기",
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            퀴즈 관리: {mod.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            총 {mod.quizQuestions.length}개 문항
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" />
            문항 추가
          </Button>
          <Link
            href={`/admin/modules/${moduleId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            모듈 편집으로
          </Link>
        </div>
      </div>

      {/* New question form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 문항 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="type">문항 유형</Label>
                <select
                  id="type"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={newQ.type}
                  onChange={(e) =>
                    setNewQ((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="multiple-choice">객관식</option>
                  <option value="true-false">O/X</option>
                  <option value="fill-in-blank">빈칸 채우기</option>
                </select>
              </div>

              <div>
                <Label htmlFor="question">질문</Label>
                <textarea
                  id="question"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newQ.question}
                  onChange={(e) =>
                    setNewQ((prev) => ({ ...prev, question: e.target.value }))
                  }
                  required
                />
              </div>

              {newQ.type === "multiple-choice" && (
                <div>
                  <Label>선택지</Label>
                  <div className="space-y-2">
                    {newQ.options.map((opt, i) => (
                      <Input
                        key={i}
                        placeholder={`선택지 ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newQ.options]
                          opts[i] = e.target.value
                          setNewQ((prev) => ({ ...prev, options: opts }))
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="correctAnswer">정답</Label>
                  <Input
                    id="correctAnswer"
                    value={newQ.correctAnswer}
                    onChange={(e) =>
                      setNewQ((prev) => ({
                        ...prev,
                        correctAnswer: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stepJump">오답 시 이동 스텝 (선택)</Label>
                  <Input
                    id="stepJump"
                    type="number"
                    value={newQ.stepJump}
                    onChange={(e) =>
                      setNewQ((prev) => ({
                        ...prev,
                        stepJump: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">해설</Label>
                <textarea
                  id="explanation"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newQ.explanation}
                  onChange={(e) =>
                    setNewQ((prev) => ({
                      ...prev,
                      explanation: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving === "new"} className="gap-1.5">
                  <Save className="h-4 w-4" />
                  {saving === "new" ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing questions */}
      <div className="space-y-4">
        {mod.quizQuestions.map((q, index) => (
          <Card key={q.id} className="border-border/50">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Q{index + 1}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[q.type] || q.type}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-destructive"
                  disabled={saving === q.id}
                  onClick={() => handleDelete(q.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="mb-2 text-sm font-medium text-foreground">
                {q.question}
              </p>

              {q.options && (
                <div className="mb-2 space-y-1">
                  {(q.options as string[]).map((opt, i) => (
                    <p
                      key={i}
                      className={`text-xs ${
                        opt === q.correctAnswer
                          ? "font-medium text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}. {opt}
                    </p>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                정답: {q.correctAnswer}
                {q.stepJump !== null && ` | 오답 시 스텝 ${q.stepJump}으로 이동`}
              </p>
            </CardContent>
          </Card>
        ))}

        {mod.quizQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              등록된 퀴즈 문항이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
