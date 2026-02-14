import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ModuleEditor } from "@/components/admin/module-editor"
import { VersionHistory } from "@/components/admin/version-history"

export const metadata: Metadata = {
  title: "모듈 편집 - CS Viz",
}

export default async function AdminModuleEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  const { id } = await params

  const mod = await prisma.module.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 20,
      },
      _count: {
        select: { quizQuestions: true, sessionRuns: true },
      },
    },
  })

  if (!mod) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mod.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            퀴즈 {mod._count.quizQuestions}개 / 세션 {mod._count.sessionRuns}회
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/modules/${id}/quiz`}
            className="text-sm text-primary hover:underline"
          >
            퀴즈 관리
          </Link>
          <Link
            href="/admin/modules"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            목록으로
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <ModuleEditor
          module={{
            id: mod.id,
            slug: mod.slug,
            title: mod.title,
            subtitle: mod.subtitle,
            outcomes: mod.outcomes,
            difficulty: mod.difficulty,
            time: mod.time,
            tag: mod.tag,
            color: mod.color,
            vizConfig: mod.vizConfig,
          }}
        />

        <VersionHistory
          moduleId={mod.id}
          versions={mod.versions.map((v) => ({
            id: v.id,
            version: v.version,
            changelog: v.changelog,
            createdBy: v.createdBy,
            createdAt: v.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
