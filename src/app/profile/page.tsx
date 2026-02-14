import type { Metadata } from "next"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { ProfileView } from "@/components/profile-view"

export const metadata: Metadata = {
  title: "프로필 - CS Viz",
  description: "나의 학습 진행도와 성과를 확인하세요.",
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <ProfileView />
      </main>
      <LandingFooter />
    </div>
  )
}
