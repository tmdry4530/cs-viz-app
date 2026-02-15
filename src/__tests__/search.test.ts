import { searchModules, searchUsers } from "@/lib/search"

describe("searchModules", () => {
  it("returns empty array for empty query", () => {
    expect(searchModules("")).toEqual([])
  })

  it("returns empty array for query shorter than 2 chars", () => {
    expect(searchModules("H")).toEqual([])
    expect(searchModules("a")).toEqual([])
  })

  it("matches by title (case-insensitive)", () => {
    const results = searchModules("HTTP")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].matchField).toBe("title")
    expect(results[0].id).toBe("http-journey")
  })

  it("matches by subtitle", () => {
    const results = searchModules("DNS")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.matchField === "subtitle")).toBe(true)
  })

  it("matches by tag", () => {
    const results = searchModules("Network")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].matchField).toBe("tag")
  })

  it("matches by outcomes", () => {
    const results = searchModules("재시도")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].matchField).toBe("outcomes")
    expect(results[0].id).toBe("http-journey")
  })

  it("is case-insensitive", () => {
    const upper = searchModules("HTTP")
    const lower = searchModules("http")
    expect(upper.length).toBe(lower.length)
    expect(upper[0].id).toBe(lower[0].id)
  })

  it("returns empty array for non-matching query", () => {
    const results = searchModules("블록체인")
    expect(results).toEqual([])
  })

  it("returns results with correct type field", () => {
    const results = searchModules("git")
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(r.type).toBe("module")
    }
  })

  it("trims whitespace from query", () => {
    const results = searchModules("  HTTP  ")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toBe("http-journey")
  })
})

describe("searchUsers", () => {
  it("returns empty array (DB integration pending)", () => {
    expect(searchUsers("김서연")).toEqual([])
    expect(searchUsers("")).toEqual([])
  })
})
