import type { Metadata } from "next"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { ModulesLibrary } from "@/components/modules-library"

export const metadata: Metadata = {
  title: "모듈 라이브러리 - CS Viz",
  description: "CS 기초 학습 모듈을 둘러보고 30분 세션을 시작하세요.",
}

export default function ModulesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <ModulesLibrary />
      </main>
      <LandingFooter />
    </div>
  )
}
