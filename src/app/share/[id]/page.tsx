import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { LandingFooter } from "@/components/landing-footer"
import { ShareCard } from "@/components/share-card"
import { prisma } from "@/lib/db"

interface SharePageProps {
  params: Promise<{ id: string }>
}

async function getShareData(slug: string) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, image: true } },
      sessionRun: {
        include: {
          module: { select: { title: true, tag: true, color: true } },
          reflections: {
            where: { isPublic: true },
            select: { content: true },
            take: 1,
          },
          quizAttempts: { select: { correct: true } },
        },
      },
    },
  })

  if (!shareLink || !shareLink.isActive) return null

  return {
    slug: shareLink.slug,
    user: shareLink.user,
    module: shareLink.sessionRun.module,
    score: shareLink.sessionRun.score,
    reflection: shareLink.sessionRun.reflections[0]?.content || null,
    quiz: {
      total: shareLink.sessionRun.quizAttempts.length,
      correct: shareLink.sessionRun.quizAttempts.filter((a) => a.correct).length,
    },
    startedAt: shareLink.sessionRun.startedAt.toISOString(),
    completedAt: shareLink.sessionRun.completedAt?.toISOString() || null,
  }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getShareData(id)

  if (!data) {
    return { title: "공유 링크를 찾을 수 없습니다 - CS Viz" }
  }

  const title = `${data.user.name || "학습자"}의 CS Viz 결과 - ${data.module.title}`
  const description = data.score
    ? `${data.module.title}에서 ${data.score}점을 기록했어요. CS Viz에서 나도 도전해보세요.`
    : "30분 동안 이걸 이해했어요. CS Viz에서 나도 도전해보세요."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/share/${id}/og`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/share/${id}/og`],
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params
  const data = await getShareData(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1 py-12">
        <ShareCard data={data} />
      </main>
      <LandingFooter />
    </div>
  )
}
