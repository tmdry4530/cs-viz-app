import { modules } from "@/lib/data"
import { graphNodes, type GraphNode } from "@/lib/cs-map-data"

export interface Recommendation {
  nodeId: string
  label: string
  category: string
  moduleId?: string
  reason: string
}

interface WeaknessScore {
  category: string
  score: number // 0.0 ~ 1.0 (1.0 = perfect)
}

/**
 * Get top 3 recommendations.
 *
 * Strategy:
 * 1. If weakness scores provided: prioritize categories with lowest scores
 * 2. If completed module IDs provided: suggest next topics (not yet completed)
 * 3. Fallback: random 3 from nodes that map to modules
 */
export function getRecommendations(options?: {
  weaknessScores?: WeaknessScore[]
  completedModuleIds?: string[]
}): Recommendation[] {
  const { weaknessScores, completedModuleIds } = options ?? {}

  // Nodes that link to actual modules get priority
  const moduleNodes = graphNodes.filter((n) => n.moduleId)
  const nonModuleNodes = graphNodes.filter((n) => !n.moduleId)

  // Filter out completed modules
  const incompleteModuleNodes = completedModuleIds
    ? moduleNodes.filter((n) => !completedModuleIds.includes(n.moduleId!))
    : moduleNodes

  // Strategy 1: weakness-based recommendations
  if (weaknessScores && weaknessScores.length > 0) {
    const sorted = [...weaknessScores].sort((a, b) => a.score - b.score)
    const weakCategories = sorted.slice(0, 3).map((w) => w.category)

    const weakNodes = graphNodes
      .filter((n) => weakCategories.includes(n.category))
      .filter(
        (n) =>
          !completedModuleIds || !n.moduleId || !completedModuleIds.includes(n.moduleId)
      )

    if (weakNodes.length >= 3) {
      return weakNodes.slice(0, 3).map((n) => toRecommendation(n, "약점 보완"))
    }
  }

  // Strategy 2: incomplete modules first
  if (incompleteModuleNodes.length > 0) {
    const results: Recommendation[] = incompleteModuleNodes
      .slice(0, 3)
      .map((n) => toRecommendation(n, "미완료 모듈"))

    // Fill remaining slots with non-module nodes
    if (results.length < 3) {
      const remaining = shuffleArray(nonModuleNodes)
        .slice(0, 3 - results.length)
        .map((n) => toRecommendation(n, "추천 토픽"))
      results.push(...remaining)
    }

    return results
  }

  // Strategy 3: fallback - random 3 from nodes (excluding completed modules)
  const available = completedModuleIds
    ? graphNodes.filter(
        (n) => !n.moduleId || !completedModuleIds.includes(n.moduleId)
      )
    : graphNodes

  return shuffleArray([...available])
    .slice(0, 3)
    .map((n) => toRecommendation(n, "추천 토픽"))
}

function toRecommendation(node: GraphNode, reason: string): Recommendation {
  return {
    nodeId: node.id,
    label: node.label,
    category: node.category,
    moduleId: node.moduleId,
    reason,
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
