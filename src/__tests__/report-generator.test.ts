import { generateMonthlyReport } from "../lib/report-generator"
import type { MonthlyReportData } from "../lib/report-generator"

describe("Report Generator", () => {
  let report: MonthlyReportData

  beforeEach(() => {
    report = generateMonthlyReport("user-123", 2, 2026)
  })

  describe("generateMonthlyReport", () => {
    it("returns report with correct userId, month, year", () => {
      expect(report.userId).toBe("user-123")
      expect(report.month).toBe(2)
      expect(report.year).toBe(2026)
    })

    it("returns summary with all required fields", () => {
      const { summary } = report
      expect(typeof summary.sessionsCompleted).toBe("number")
      expect(typeof summary.totalTimeMinutes).toBe("number")
      expect(typeof summary.quizAccuracy).toBe("number")
      expect(typeof summary.streakDays).toBe("number")
      expect(typeof summary.topTopic).toBe("string")
      expect(typeof summary.communityPosts).toBe("number")
      expect(typeof summary.communityReactions).toBe("number")
    })

    it("returns valid summary ranges", () => {
      const { summary } = report
      expect(summary.sessionsCompleted).toBeGreaterThanOrEqual(0)
      expect(summary.totalTimeMinutes).toBeGreaterThanOrEqual(0)
      expect(summary.quizAccuracy).toBeGreaterThanOrEqual(0)
      expect(summary.quizAccuracy).toBeLessThanOrEqual(100)
      expect(summary.streakDays).toBeGreaterThanOrEqual(0)
      expect(summary.topTopic.length).toBeGreaterThan(0)
      expect(summary.communityPosts).toBeGreaterThanOrEqual(0)
      expect(summary.communityReactions).toBeGreaterThanOrEqual(0)
    })

    it("returns category growth for all CS categories", () => {
      expect(report.categoryGrowth.length).toBe(8)
      report.categoryGrowth.forEach((cat) => {
        expect(typeof cat.category).toBe("string")
        expect(typeof cat.score).toBe("number")
        expect(typeof cat.previousScore).toBe("number")
        expect(typeof cat.growth).toBe("number")
        expect(cat.score).toBeGreaterThanOrEqual(0)
        expect(cat.score).toBeLessThanOrEqual(100)
        expect(cat.growth).toBe(cat.score - cat.previousScore)
      })
    })

    it("returns daily streak for correct number of days", () => {
      // February 2026 has 28 days
      expect(report.dailyStreak.length).toBe(28)
      report.dailyStreak.forEach((day) => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(typeof day.active).toBe("boolean")
        expect(typeof day.sessionsCount).toBe("number")
        if (!day.active) {
          expect(day.sessionsCount).toBe(0)
        }
        if (day.active) {
          expect(day.sessionsCount).toBeGreaterThanOrEqual(1)
        }
      })
    })

    it("returns correct days for months with different lengths", () => {
      // January = 31 days
      const jan = generateMonthlyReport("user-1", 1, 2026)
      expect(jan.dailyStreak.length).toBe(31)

      // April = 30 days
      const apr = generateMonthlyReport("user-1", 4, 2026)
      expect(apr.dailyStreak.length).toBe(30)

      // February 2024 (leap year) = 29 days
      const febLeap = generateMonthlyReport("user-1", 2, 2024)
      expect(febLeap.dailyStreak.length).toBe(29)
    })

    it("returns 4 weeks of activity data", () => {
      expect(report.weeklyActivity.length).toBe(4)
      report.weeklyActivity.forEach((week) => {
        expect(week.week).toBeGreaterThanOrEqual(1)
        expect(week.week).toBeLessThanOrEqual(4)
        expect(typeof week.sessionsCompleted).toBe("number")
        expect(typeof week.timeMinutes).toBe("number")
        expect(typeof week.quizAccuracy).toBe("number")
      })
    })

    it("returns 2-4 highlights", () => {
      expect(report.highlights.length).toBeGreaterThanOrEqual(2)
      expect(report.highlights.length).toBeLessThanOrEqual(4)
      report.highlights.forEach((h) => {
        expect(["achievement", "milestone", "streak", "improvement"]).toContain(h.type)
        expect(typeof h.title).toBe("string")
        expect(typeof h.description).toBe("string")
        expect(typeof h.value).toBe("string")
      })
    })

    it("returns comparison with all fields", () => {
      const { comparison } = report
      expect(typeof comparison.sessionsChange).toBe("number")
      expect(typeof comparison.timeChange).toBe("number")
      expect(typeof comparison.accuracyChange).toBe("number")
      expect(typeof comparison.streakChange).toBe("number")
    })

    it("generates different reports for different calls (probabilistic)", () => {
      const report1 = generateMonthlyReport("user-1", 1, 2026)
      const report2 = generateMonthlyReport("user-1", 1, 2026)
      // At least some value should differ between two random generations
      const diff =
        report1.summary.sessionsCompleted !== report2.summary.sessionsCompleted ||
        report1.summary.quizAccuracy !== report2.summary.quizAccuracy ||
        report1.summary.totalTimeMinutes !== report2.summary.totalTimeMinutes
      // This is probabilistic, but with random data it's extremely unlikely to be identical
      expect(diff).toBe(true)
    })
  })
})
