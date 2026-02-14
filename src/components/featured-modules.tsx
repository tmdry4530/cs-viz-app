"use client"

import { modules } from "@/lib/data"
import { ModuleCard } from "@/components/module-card"

export function FeaturedModules() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            인기 모듈
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            가장 많이 선택되는 CS 기초 학습 모듈을 시작해보세요.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </div>
    </section>
  )
}
