import { ImageResponse } from "@vercel/og"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shareLink = await prisma.shareLink.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true } },
        sessionRun: {
          include: {
            module: { select: { title: true, tag: true } },
            reflections: {
              where: { isPublic: true },
              select: { content: true },
              take: 1,
            },
          },
        },
      },
    })

    if (!shareLink || !shareLink.isActive) {
      return new Response("Not found", { status: 404 })
    }

    const { module } = shareLink.sessionRun
    const score = shareLink.sessionRun.score
    const reflection = shareLink.sessionRun.reflections[0]?.content || ""
    const userName = shareLink.user.name || "학습자"

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
            padding: "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "white",
                fontWeight: 700,
              }}
            >
              C
            </div>
            <span
              style={{ fontSize: "24px", color: "#fafafa", fontWeight: 700 }}
            >
              CS Viz
            </span>
          </div>

          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#fafafa",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            30분 동안 이걸 이해했어요
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#a1a1aa",
              marginBottom: "40px",
            }}
          >
            {module.title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {score != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "64px",
                    fontWeight: 700,
                    color: "#22c55e",
                  }}
                >
                  {score}
                </span>
                <span style={{ fontSize: "24px", color: "#a1a1aa" }}>점</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#1c1c1c",
                border: "1px solid #2a2a2a",
              }}
            >
              <span style={{ fontSize: "18px", color: "#a1a1aa" }}>
                {module.tag}
              </span>
            </div>
          </div>

          {reflection && (
            <div
              style={{
                fontSize: "20px",
                color: "#71717a",
                lineHeight: 1.6,
                maxHeight: "120px",
                overflow: "hidden",
              }}
            >
              {reflection.slice(0, 150)}
              {reflection.length > 150 ? "..." : ""}
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "18px", color: "#52525b" }}>
              {userName}
            </span>
            <span style={{ fontSize: "18px", color: "#52525b" }}>
              csviz.app
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (error) {
    console.error("OG Image generation error:", error)
    return new Response("Failed to generate image", { status: 500 })
  }
}
