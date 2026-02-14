import { modules, type Module } from "@/lib/data"

export interface ModuleSearchResult {
  type: "module"
  id: string
  title: string
  subtitle: string
  tag: string
  difficulty: string
  matchField: string
}

export interface UserSearchResult {
  type: "user"
  id: string
  name: string
  email: string
}

export type SearchResult = ModuleSearchResult | UserSearchResult

/**
 * Search modules by title, subtitle, tag, or outcomes.
 * Requires minimum 2 characters. Case-insensitive.
 */
export function searchModules(query: string): ModuleSearchResult[] {
  if (!query || query.trim().length < 2) {
    return []
  }

  const q = query.trim().toLowerCase()

  const results: ModuleSearchResult[] = []

  for (const mod of modules) {
    let matchField: string | null = null

    if (mod.title.toLowerCase().includes(q)) {
      matchField = "title"
    } else if (mod.subtitle.toLowerCase().includes(q)) {
      matchField = "subtitle"
    } else if (mod.tag.toLowerCase().includes(q)) {
      matchField = "tag"
    } else if (mod.outcomes.some((o) => o.toLowerCase().includes(q))) {
      matchField = "outcomes"
    }

    if (matchField) {
      results.push({
        type: "module",
        id: mod.id,
        title: mod.title,
        subtitle: mod.subtitle,
        tag: mod.tag,
        difficulty: mod.difficulty,
        matchField,
      })
    }
  }

  return results
}

/**
 * Search users (placeholder - returns mock results).
 * Requires minimum 2 characters. Case-insensitive.
 */
export function searchUsers(query: string): UserSearchResult[] {
  if (!query || query.trim().length < 2) {
    return []
  }

  const q = query.trim().toLowerCase()

  const mockUsers = [
    { id: "mock-1", name: "김서연", email: "seyeon@example.com" },
    { id: "mock-2", name: "이준호", email: "junho@example.com" },
    { id: "mock-3", name: "박민지", email: "minji@example.com" },
  ]

  return mockUsers
    .filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
    .map((u) => ({
      type: "user" as const,
      ...u,
    }))
}
