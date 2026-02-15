import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPlan } from "@/lib/feature-flags"
import type { FeatureFlag } from "@/lib/feature-flags"
import { hasFeature } from "@/lib/feature-flags"

/**
 * Guard that checks if the current user has a Pro subscription.
 * Returns the session if authorized, or a 401/403 NextResponse.
 */
export async function requirePro(): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      ),
    }
  }

  const plan = await getPlan(session.user.id)

  if (plan !== "pro") {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Pro 구독이 필요한 기능입니다.",
          upgrade: "/pricing",
        },
        { status: 403 }
      ),
    }
  }

  return { authorized: true, userId: session.user.id }
}

/**
 * Guard that checks if the current user has access to a specific feature.
 */
export async function requireFeature(flag: FeatureFlag): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      ),
    }
  }

  const allowed = await hasFeature(session.user.id, flag)

  if (!allowed) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Pro 구독이 필요한 기능입니다.",
          upgrade: "/pricing",
        },
        { status: 403 }
      ),
    }
  }

  return { authorized: true, userId: session.user.id }
}
