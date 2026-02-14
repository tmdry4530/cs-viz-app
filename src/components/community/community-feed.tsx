"use client"

import { useState, useEffect, useCallback } from "react"
import { FeedPost } from "./feed-post"
import { CommentThread } from "./comment-thread"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FeedPostData {
  id: string
  content: string
  score: number | null
  badge: string | null
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
  sessionRun: {
    id: string
    module: { title: string; slug: string; tag: string }
  }
  _count: { comments: number; reactions: number }
}

const tabs = ["인기", "최신"] as const

export function CommunityFeed() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("인기")
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [posts, setPosts] = useState<FeedPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const sort = activeTab === "인기" ? "popular" : "recent"

  const fetchPosts = useCallback(
    async (pageNum: number, sortBy: string, append: boolean) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        const res = await fetch(
          `/api/community?sort=${sortBy}&page=${pageNum}&limit=10`
        )
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()

        if (append) {
          setPosts((prev) => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }

        setHasMore(pageNum < data.pagination.totalPages)
      } catch {
        // show empty state on error
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    []
  )

  useEffect(() => {
    setPage(1)
    setExpandedPost(null)
    fetchPosts(1, sort, false)
  }, [sort, fetchPosts])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, sort, true)
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-2xl px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            커뮤니티
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            다른 학습자들의 세션 결과를 보고 함께 성장하세요.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              아직 공유된 세션이 없습니다.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              첫 세션을 완료하고 커뮤니티에 공유해보세요!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-0">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedPost(
                      expandedPost === post.id ? null : post.id
                    )
                  }
                >
                  <FeedPost post={post} />
                </div>
                {expandedPost === post.id && (
                  <div className="rounded-b-xl border border-t-0 border-border/50 bg-card p-5">
                    <CommentThread postId={post.id} />
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <Button
                variant="outline"
                className="mx-auto"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                더 보기
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
