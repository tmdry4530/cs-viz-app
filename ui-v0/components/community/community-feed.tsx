"use client"

import { useState } from "react"
import { feedPosts } from "@/lib/data"
import { FeedPost } from "./feed-post"
import { CommentThread } from "./comment-thread"

const tabs = ["인기", "최신"] as const

export function CommunityFeed() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("인기")
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

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

        <div className="flex flex-col gap-4">
          {feedPosts.map((post) => (
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
                  <CommentThread />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
