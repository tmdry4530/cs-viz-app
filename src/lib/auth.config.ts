import type { NextAuthConfig } from "next-auth"

// Edge-safe auth config (no Prisma, no bcrypt, no Node.js modules)
// Used by middleware only
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts (not needed for middleware)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl

      const protectedPaths = ["/profile", "/session"]
      const isProtected = protectedPaths.some((path) =>
        pathname.startsWith(path)
      )

      if (isProtected && !isLoggedIn) {
        return false
      }

      return true
    },
  },
}
