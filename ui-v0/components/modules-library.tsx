"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { modules } from "@/lib/data"
import { ModuleCard } from "@/components/module-card"

const tags = ["전체", "Network", "OS/Concurrency", "DevTools"]

export function ModulesLibrary() {
  const [activeTag, setActiveTag] = useState("전체")
  const [search, setSearch] = useState("")

  const filtered = modules.filter((mod) => {
    const matchesTag = activeTag === "전체" || mod.tag === activeTag
    const matchesSearch =
      search === "" ||
      mod.title.toLowerCase().includes(search.toLowerCase()) ||
      mod.subtitle.toLowerCase().includes(search.toLowerCase())
    return matchesTag && matchesSearch
  })

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            모듈 라이브러리
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            관심 있는 CS 주제를 선택하고 30분 세션으로 학습을 시작하세요.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="모듈 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border/50 bg-card pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mod) => (
              <ModuleCard key={mod.id} module={mod} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20">
            <p className="text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Badge variant="outline" className="border-border/80 text-xs text-muted-foreground">
            총 {filtered.length}개 모듈
          </Badge>
        </div>
      </div>
    </section>
  )
}
