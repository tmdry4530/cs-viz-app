import { NavHeader } from "@/components/nav-header"
import { LandingHero } from "@/components/landing-hero"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedModules } from "@/components/featured-modules"
import { LandingFooter } from "@/components/landing-footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">
        <LandingHero />
        <FeaturedModules />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  )
}
