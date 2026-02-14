"use client"

import Link from "next/link"
import { Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Module } from "@/lib/data"

export function ModuleCard({ module }: { module: Module }) {
  return (
    <Link href={`/session/${module.id}`}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5">
        <div
          className="h-1 w-full"
          style={{ backgroundColor: module.color }}
        />
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-border/80 text-xs text-muted-foreground"
            >
              {module.tag}
            </Badge>
            <Badge
              variant="outline"
              className="border-border/80 text-xs text-muted-foreground"
            >
              {module.difficulty}
            </Badge>
          </div>

          <h3 className="mb-1.5 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {module.title}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {module.subtitle}
          </p>

          <div className="mt-auto flex flex-col gap-2">
            {module.outcomes.map((outcome, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {outcome}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {module.time}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              세션 시작
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
