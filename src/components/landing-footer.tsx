import { Terminal } from "lucide-react"
import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row lg:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <Terminal className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">CS Viz</span>
        </div>
        <nav className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/modules" className="hover:text-foreground transition-colors">
            모듈
          </Link>
          <Link href="/community" className="hover:text-foreground transition-colors">
            커뮤니티
          </Link>
          <Link href="/profile" className="hover:text-foreground transition-colors">
            프로필
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          CS Viz. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
