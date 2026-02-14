import type { Metadata } from "next"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { CommunityFeed } from "@/components/community/community-feed"

export const metadata: Metadata = {
  title: "커뮤니티 - CS Viz",
  description: "다른 학습자들의 세션 결과를 보고 함께 학습하세요.",
}

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <CommunityFeed />
      </main>
      <LandingFooter />
    </div>
  )
}
