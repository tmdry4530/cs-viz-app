import { isSpam } from "../lib/spam-detector"

describe("isSpam", () => {
  describe("URL count rule", () => {
    it("flags content with 3+ URLs as spam", () => {
      const content =
        "Check https://a.com and https://b.com and https://c.com"
      const result = isSpam(content)
      expect(result.spam).toBe(true)
      expect(result.reason).toContain("URL")
      expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    })

    it("allows content with fewer than 3 URLs", () => {
      const content = "Visit https://a.com and https://b.com"
      const result = isSpam(content)
      expect(result.spam).toBe(false)
    })

    it("allows content with no URLs", () => {
      const result = isSpam("This is a normal message")
      expect(result.spam).toBe(false)
    })
  })

  describe("repeated characters rule", () => {
    it("flags content with 5+ consecutive repeated characters", () => {
      const result = isSpam("Hellooooo world")
      expect(result.spam).toBe(true)
      expect(result.reason).toContain("반복 문자")
      expect(result.confidence).toBeGreaterThanOrEqual(0.7)
    })

    it("flags long repeated characters", () => {
      const result = isSpam("aaaaaaaaa")
      expect(result.spam).toBe(true)
    })

    it("allows normal text with some repetition", () => {
      const result = isSpam("good book")
      expect(result.spam).toBe(false)
    })

    it("allows exactly 4 repeated characters", () => {
      const result = isSpam("goood morning")
      expect(result.spam).toBe(false)
    })
  })

  describe("banned patterns rule", () => {
    it("flags 'buy now' spam", () => {
      const result = isSpam("Buy now and get 50% off!")
      expect(result.spam).toBe(true)
      expect(result.reason).toContain("스팸 패턴")
    })

    it("flags 'free money' spam", () => {
      const result = isSpam("Get free money today!")
      expect(result.spam).toBe(true)
    })

    it("flags casino spam", () => {
      const result = isSpam("Win big at our casino")
      expect(result.spam).toBe(true)
    })

    it("flags crypto airdrop spam", () => {
      const result = isSpam("Join our crypto airdrop now")
      expect(result.spam).toBe(true)
    })

    it("is case insensitive for banned patterns", () => {
      const result = isSpam("BUY NOW for limited time")
      expect(result.spam).toBe(true)
    })

    it("allows normal content", () => {
      const result = isSpam("I learned about binary search trees today")
      expect(result.spam).toBe(false)
    })
  })

  describe("rapid posting rule", () => {
    it("flags rapid posting when recentPostCount >= 3", () => {
      const result = isSpam("Normal content", {
        userId: "user1",
        recentPostCount: 3,
      })
      expect(result.spam).toBe(true)
      expect(result.reason).toContain("빠르게")
    })

    it("flags rapid posting when recentPostCount > 3", () => {
      const result = isSpam("Normal content", {
        userId: "user1",
        recentPostCount: 5,
      })
      expect(result.spam).toBe(true)
    })

    it("allows posting when recentPostCount < 3", () => {
      const result = isSpam("Normal content", {
        userId: "user1",
        recentPostCount: 2,
      })
      expect(result.spam).toBe(false)
    })

    it("allows posting when no metadata provided", () => {
      const result = isSpam("Normal content")
      expect(result.spam).toBe(false)
    })

    it("allows posting when userId is missing", () => {
      const result = isSpam("Normal content", { recentPostCount: 5 })
      expect(result.spam).toBe(false)
    })
  })

  describe("clean content", () => {
    it("returns spam=false for normal Korean text", () => {
      const result = isSpam("오늘 자료구조 강의를 들었습니다. 매우 유익했어요!")
      expect(result.spam).toBe(false)
      expect(result.reason).toBe("")
      expect(result.confidence).toBe(0)
    })

    it("returns spam=false for technical content", () => {
      const result = isSpam(
        "Binary search has O(log n) time complexity. It works by dividing the search space in half."
      )
      expect(result.spam).toBe(false)
    })

    it("returns spam=false for content with 1 URL", () => {
      const result = isSpam(
        "Check out this resource: https://example.com/article"
      )
      expect(result.spam).toBe(false)
    })

    it("returns spam=false for empty string", () => {
      const result = isSpam("")
      expect(result.spam).toBe(false)
    })
  })

  describe("priority order", () => {
    it("checks URL count before other rules", () => {
      const content =
        "Buy now at https://a.com https://b.com https://c.com aaaaaaa"
      const result = isSpam(content)
      expect(result.spam).toBe(true)
      expect(result.reason).toContain("URL")
    })
  })
})
