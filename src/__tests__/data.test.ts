import { modules, feedPosts, sessionStages } from "@/lib/data"

describe("modules data", () => {
  it("has at least 3 modules", () => {
    expect(modules.length).toBeGreaterThanOrEqual(3)
  })

  it("each module has required fields", () => {
    for (const mod of modules) {
      expect(mod.id).toBeTruthy()
      expect(mod.title).toBeTruthy()
      expect(mod.subtitle).toBeTruthy()
      expect(mod.outcomes.length).toBeGreaterThan(0)
      expect(mod.difficulty).toBeTruthy()
      expect(mod.time).toBeTruthy()
      expect(mod.tag).toBeTruthy()
      expect(mod.color).toBeTruthy()
    }
  })

  it("each module has unique id", () => {
    const ids = modules.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("feedPosts data", () => {
  it("has at least 1 post", () => {
    expect(feedPosts.length).toBeGreaterThan(0)
  })

  it("each post has required fields", () => {
    for (const post of feedPosts) {
      expect(post.id).toBeTruthy()
      expect(post.author).toBeTruthy()
      expect(post.module).toBeTruthy()
      expect(typeof post.score).toBe("number")
      expect(typeof post.likes).toBe("number")
      expect(typeof post.comments).toBe("number")
    }
  })
})

describe("sessionStages", () => {
  it("has 4 stages", () => {
    expect(sessionStages.length).toBe(4)
  })

  it("stages are in correct order", () => {
    const ids = sessionStages.map((s) => s.id)
    expect(ids).toEqual(["viz", "quiz", "apply", "reflection"])
  })

  it("each stage has label and duration", () => {
    for (const stage of sessionStages) {
      expect(stage.label).toBeTruthy()
      expect(stage.duration).toBeTruthy()
      expect(typeof stage.minutes).toBe("number")
    }
  })
})
