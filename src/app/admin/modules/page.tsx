import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "모듈 관리 - CS Viz",
}

export default async function AdminModulesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== "admin") {
    redirect("/")
  }

  const modules = await prisma.module.findMany({
    include: {
      _count: {
        select: {
          quizQuestions: true,
          versions: true,
          sessionRuns: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">모듈 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            학습 모듈을 편집하고 버전을 관리하세요.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          관리자 콘솔로 돌아가기
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {modules.map((mod) => (
          <Link key={mod.id} href={`/admin/modules/${mod.id}`}>
            <Card className="border-border/50 transition-colors hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {mod.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mod.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{ borderColor: mod.color, color: mod.color }}
                    >
                      {mod.tag}
                    </Badge>
                    <Badge variant="secondary">{mod.difficulty}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>퀴즈 {mod._count.quizQuestions}개</span>
                  <span>버전 {mod._count.versions}개</span>
                  <span>세션 {mod._count.sessionRuns}회</span>
                  <span>slug: {mod.slug}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {modules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              등록된 모듈이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
