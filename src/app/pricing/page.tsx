"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlanCard } from "@/components/pricing/plan-card"
import { CheckoutButton } from "@/components/pricing/checkout-button"
import type { Plan } from "@/lib/feature-flags"

const FREE_FEATURES = [
  { text: "기본 CS 시각화 학습", included: true },
  { text: "퀴즈 & 실습 문제", included: true },
  { text: "학습 진도 추적", included: true },
  { text: "커뮤니티 피드", included: true },
  { text: "기본 진단 테스트", included: true },
  { text: "AI 코치 피드백", included: false },
  { text: "스터디 룸", included: false },
  { text: "월간 학습 리포트", included: false },
  { text: "고급 진단 분석", included: false },
  { text: "무제한 학습 세션", included: false },
]

const PRO_FEATURES = [
  { text: "기본 CS 시각화 학습", included: true },
  { text: "퀴즈 & 실습 문제", included: true },
  { text: "학습 진도 추적", included: true },
  { text: "커뮤니티 피드", included: true },
  { text: "기본 진단 테스트", included: true },
  { text: "AI 코치 피드백", included: true },
  { text: "스터디 룸", included: true },
  { text: "월간 학습 리포트", included: true },
  { text: "고급 진단 분석", included: true },
  { text: "무제한 학습 세션", included: true },
]

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<Plan>("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan) setCurrentPlan(data.plan)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">요금제</h1>
        <p className="text-muted-foreground text-lg">
          CS 학습을 더 효과적으로. 나에게 맞는 플랜을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <PlanCard
          name="Free"
          price="₩0"
          period="/월"
          description="CS 기초를 시작하는 학습자"
          features={FREE_FEATURES}
          isCurrentPlan={currentPlan === "free"}
        >
          {currentPlan === "free" && (
            <Button variant="outline" disabled className="w-full">
              현재 플랜
            </Button>
          )}
        </PlanCard>

        <PlanCard
          name="Pro"
          price="₩9,900"
          period="/월"
          description="깊이 있는 학습과 맞춤 피드백"
          features={PRO_FEATURES}
          isPro
          isCurrentPlan={currentPlan === "pro"}
        >
          {currentPlan === "pro" ? (
            <Button variant="outline" disabled className="w-full">
              현재 플랜
            </Button>
          ) : (
            <CheckoutButton
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            />
          )}
        </PlanCard>
      </div>
    </div>
  )
}
