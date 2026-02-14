import { getRecommendations } from "@/lib/recommendation"
import { graphNodes } from "@/lib/cs-map-data"

describe("getRecommendations", () => {
  it("returns exactly 3 recommendations", () => {
    const results = getRecommendations()
    expect(results).toHaveLength(3)
  })

  it("each recommendation has required fields", () => {
    const results = getRecommendations()
    for (const rec of results) {
      expect(rec.nodeId).toBeTruthy()
      expect(rec.label).toBeTruthy()
      expect(rec.category).toBeTruthy()
      expect(rec.reason).toBeTruthy()
    }
  })

  it("prioritizes incomplete module nodes when no options given", () => {
    const results = getRecommendations()
    // Should include at least one node that maps to a module
    const withModule = results.filter((r) => r.moduleId)
    expect(withModule.length).toBeGreaterThan(0)
  })

  it("returns recommendations with reason '미완료 모듈' for default call", () => {
    const results = getRecommendations()
    const incomplete = results.filter((r) => r.reason === "미완료 모듈")
    expect(incomplete.length).toBeGreaterThan(0)
  })

  it("excludes completed modules", () => {
    const results = getRecommendations({
      completedModuleIds: ["http-journey", "concurrency", "git-pr"],
    })
    expect(results).toHaveLength(3)
    // None should have a moduleId that was completed
    for (const rec of results) {
      if (rec.moduleId) {
        expect(["http-journey", "concurrency", "git-pr"]).not.toContain(
          rec.moduleId
        )
      }
    }
  })

  it("uses weakness scores when provided", () => {
    const results = getRecommendations({
      weaknessScores: [
        { category: "networking", score: 0.2 },
        { category: "concurrency", score: 0.3 },
        { category: "data-structures", score: 0.9 },
        { category: "version-control", score: 0.8 },
        { category: "os-basics", score: 0.7 },
      ],
    })
    expect(results).toHaveLength(3)
    // Should prioritize weakest categories (networking, concurrency)
    const categories = results.map((r) => r.category)
    expect(
      categories.includes("networking") || categories.includes("concurrency")
    ).toBe(true)
  })

  it("weakness-based recommendations have correct reason", () => {
    const results = getRecommendations({
      weaknessScores: [
        { category: "networking", score: 0.1 },
        { category: "concurrency", score: 0.2 },
        { category: "os-basics", score: 0.3 },
        { category: "data-structures", score: 0.9 },
        { category: "version-control", score: 0.8 },
      ],
    })
    const weakRecs = results.filter((r) => r.reason === "약점 보완")
    expect(weakRecs.length).toBe(3)
  })

  it("returns valid node references", () => {
    const results = getRecommendations()
    const nodeIds = graphNodes.map((n) => n.id)
    for (const rec of results) {
      expect(nodeIds).toContain(rec.nodeId)
    }
  })
})
