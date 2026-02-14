import { modules } from "@/lib/data"
import { SessionPlayerShell } from "@/components/session/session-player-shell"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return modules.map((m) => ({ id: m.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const mod = modules.find((m) => m.id === id)
  if (!mod) return { title: "세션을 찾을 수 없습니다" }
  return {
    title: `${mod.title} - CS Viz 세션`,
    description: mod.subtitle,
  }
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const mod = modules.find((m) => m.id === id)
  if (!mod) notFound()

  return <SessionPlayerShell module={mod} />
}
