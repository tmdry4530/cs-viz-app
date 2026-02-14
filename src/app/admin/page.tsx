import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AdminReportList } from "@/components/admin/report-list"

export const metadata: Metadata = {
  title: "관리자 - CS Viz",
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Check admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== "admin") {
    redirect("/")
  }

  const [reports, moderationStats, autoHideLog] = await Promise.all([
    prisma.report.findMany({
      where: { status: "pending" },
      include: {
        user: { select: { name: true, email: true } },
        actions: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Moderation stats
    Promise.all([
      prisma.report.count({ where: { status: "pending" } }),
      prisma.report.count({ where: { status: "resolved" } }),
      prisma.report.count({ where: { status: "dismissed" } }),
      prisma.adminAction.count({ where: { action: "auto-hide" } }),
      prisma.adminAction.count({ where: { action: "spam-detected" } }),
      prisma.feedPost.count({ where: { isPublic: false } }),
    ]),
    // Auto-hide log (recent)
    prisma.adminAction.findMany({
      where: { action: { in: ["auto-hide", "spam-detected"] } },
      include: {
        report: { select: { targetType: true, targetId: true, reason: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  const [pendingCount, resolvedCount, dismissedCount, autoHideCount, spamCount, hiddenPostCount] = moderationStats

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">관리자 콘솔</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          신고된 콘텐츠를 검토하고 조치하세요.
        </p>
      </div>

      {/* Moderation Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">대기 중 신고</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-2xl font-bold text-green-500">{resolvedCount}</p>
          <p className="text-xs text-muted-foreground">처리 완료</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-2xl font-bold text-muted-foreground">{dismissedCount}</p>
          <p className="text-xs text-muted-foreground">무시됨</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-2xl font-bold text-orange-500">{autoHideCount}</p>
          <p className="text-xs text-muted-foreground">자동 숨김</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-2xl font-bold text-red-500">{spamCount}</p>
          <p className="text-xs text-muted-foreground">스팸 감지</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-2xl font-bold text-foreground">{hiddenPostCount}</p>
          <p className="text-xs text-muted-foreground">숨겨진 게시물</p>
        </div>
      </div>

      {/* Auto-hide Log */}
      {autoHideLog.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">자동 조치 로그</h2>
          <div className="space-y-2">
            {autoHideLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      log.action === "spam-detected"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                    }`}
                  >
                    {log.action === "spam-detected" ? "스팸" : "자동숨김"}
                  </span>
                  <span className="text-muted-foreground">
                    {log.report.targetType === "post" ? "게시글" : "댓글"} -{" "}
                    <code className="rounded bg-secondary px-1 py-0.5 text-xs">
                      {log.report.targetId.slice(0, 8)}...
                    </code>
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {log.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-foreground">신고 목록</h2>
      <AdminReportList
        reports={reports.map((r) => ({
          id: r.id,
          targetType: r.targetType,
          targetId: r.targetId,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          reporter: r.user.name || r.user.email,
          actionCount: r.actions.length,
        }))}
      />
    </div>
  )
}
