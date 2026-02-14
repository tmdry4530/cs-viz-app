import type { Metadata } from "next"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { ShareCard } from "@/components/share-card"

export const metadata: Metadata = {
  title: "학습 결과 공유 - CS Viz",
  description: "30분 동안 이걸 이해했어요. CS Viz에서 나도 도전해보세요.",
}

export default function SharePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1 py-12">
        <ShareCard />
      </main>
      <LandingFooter />
    </div>
  )
}
