"use client"

import { MonitorPlay, HelpCircle, Code2, MessageSquare } from "lucide-react"

const steps = [
  {
    icon: MonitorPlay,
    title: "Viz (12분)",
    description:
      "인터랙티브 시각화를 통해 CS 개념이 실제로 어떻게 작동하는지 눈으로 확인합니다.",
  },
  {
    icon: HelpCircle,
    title: "퀴즈 (7분)",
    description:
      "핵심 개념을 확인하는 퀴즈를 풀고, 해설을 통해 이해도를 점검합니다.",
  },
  {
    icon: Code2,
    title: "실무 적용 (6분)",
    description:
      "로그 분석, 코드 수정 등 실무에서 만나는 상황을 직접 경험합니다.",
  },
  {
    icon: MessageSquare,
    title: "3문장 설명 (3분)",
    description:
      "배운 내용을 3문장으로 정리하며 개발자에게 설명하는 연습을 합니다.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-t border-border/50 bg-card/50 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            30분 세션 구성
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            4단계로 구성된 세션에서 개념을 시각화하고, 확인하고, 적용하고, 정리합니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-border"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
