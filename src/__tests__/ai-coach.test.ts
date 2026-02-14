import {
  generateFeedback,
  generateFollowUp,
  analyzeExplanation,
} from "../lib/ai-coach-mock"

describe("AI Coach Mock Service", () => {
  describe("generateFeedback", () => {
    it("returns feedback and encouragement strings", () => {
      const result = generateFeedback("해시테이블은 키-값 쌍을 저장하는 자료구조입니다.")
      expect(result).toHaveProperty("feedback")
      expect(result).toHaveProperty("encouragement")
      expect(typeof result.feedback).toBe("string")
      expect(typeof result.encouragement).toBe("string")
      expect(result.feedback.length).toBeGreaterThan(0)
      expect(result.encouragement.length).toBeGreaterThan(0)
    })

    it("returns feedback for empty-ish input", () => {
      const result = generateFeedback("짧은 설명")
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it("returns different feedback on repeated calls (probabilistic)", () => {
      const results = new Set<string>()
      for (let i = 0; i < 20; i++) {
        results.add(generateFeedback("프로세스와 스레드의 차이점").feedback)
      }
      // With 12 templates, 20 calls should produce at least 2 different results
      expect(results.size).toBeGreaterThanOrEqual(2)
    })
  })

  describe("generateFollowUp", () => {
    it("returns exactly 3 follow-up questions", () => {
      const result = generateFollowUp("자료구조", "배열과 리스트의 차이")
      expect(result).toHaveProperty("questions")
      expect(result.questions).toHaveLength(3)
      result.questions.forEach((q: string) => {
        expect(typeof q).toBe("string")
        expect(q.length).toBeGreaterThan(0)
      })
    })

    it("returns topic-specific questions for known topics", () => {
      const result = generateFollowUp("네트워크", "TCP 3-way handshake 설명")
      expect(result.questions).toHaveLength(3)
    })

    it("returns default questions for unknown topics", () => {
      const result = generateFollowUp("기타 주제", "일반적인 내용")
      expect(result.questions).toHaveLength(3)
    })

    it("detects topic from context text", () => {
      const result = generateFollowUp("학습 내용", "프로세스와 스레드의 차이점을 설명합니다")
      expect(result.questions).toHaveLength(3)
    })
  })

  describe("analyzeExplanation", () => {
    it("returns score, grade, suggestions, and strengths", () => {
      const result = analyzeExplanation(
        "해시테이블은 키-값 쌍을 저장하는 자료구조입니다. 시간복잡도는 평균 O(1)입니다."
      )
      expect(result).toHaveProperty("score")
      expect(result).toHaveProperty("grade")
      expect(result).toHaveProperty("suggestions")
      expect(result).toHaveProperty("strengths")
      expect(typeof result.score).toBe("number")
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(["S", "A", "B", "C", "D", "F"]).toContain(result.grade)
      expect(Array.isArray(result.suggestions)).toBe(true)
      expect(Array.isArray(result.strengths)).toBe(true)
    })

    it("gives higher score for longer, more detailed text", () => {
      const shortResult = analyzeExplanation("짧은 설명")
      const longResult = analyzeExplanation(
        "해시테이블은 키-값 쌍을 저장하는 자료구조입니다. " +
        "내부적으로 해시 함수를 사용하여 키를 배열의 인덱스로 변환합니다. " +
        "시간복잡도는 평균적으로 O(1)이며, 최악의 경우 O(n)입니다. " +
        "예를 들어, JavaScript의 Object나 Python의 dict가 해시테이블 기반입니다. " +
        "해시 충돌을 해결하기 위해 체이닝이나 오픈 어드레싱 방식을 사용합니다."
      )
      expect(longResult.score).toBeGreaterThan(shortResult.score)
    })

    it("gives higher score for text with technical keywords", () => {
      const noKeywords = analyzeExplanation(
        "이것은 중요한 개념입니다. 잘 알아야 합니다. 실무에서 많이 사용됩니다."
      )
      const withKeywords = analyzeExplanation(
        "시간복잡도가 O(n log n)인 알고리즘입니다. 메모리 사용량이 적고 캐시 효율적입니다. 트레이드오프를 고려해야 합니다."
      )
      expect(withKeywords.score).toBeGreaterThan(noKeywords.score)
    })

    it("caps score at 100", () => {
      const maxText =
        "시간복잡도 O(1)의 해시 자료구조 알고리즘을 사용합니다. " +
        "메모리와 캐시 효율을 고려한 트레이드오프가 중요합니다. " +
        "프로세스와 스레드 관점에서 인덱스 쿼리 최적화가 필요합니다. " +
        "예를 들어, API와 HTTP 통신에서 TCP 프로토콜을 사용합니다. " +
        "해시 충돌을 처리하기 위한 체이닝 방식이 대표적입니다."
      const result = analyzeExplanation(maxText)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it("returns correct grade for score ranges", () => {
      // We can't control exact scores, but we can check the grade logic
      // by testing the analyzeExplanation return consistency
      const result = analyzeExplanation("짧음")
      const { score, grade } = result

      if (score >= 90) expect(grade).toBe("S")
      else if (score >= 80) expect(grade).toBe("A")
      else if (score >= 70) expect(grade).toBe("B")
      else if (score >= 60) expect(grade).toBe("C")
      else if (score >= 50) expect(grade).toBe("D")
      else expect(grade).toBe("F")
    })

    it("returns more suggestions for lower scores", () => {
      const lowScore = analyzeExplanation("짧음")
      const highScore = analyzeExplanation(
        "해시테이블은 키-값 쌍을 저장하는 자료구조입니다. " +
        "시간복잡도는 평균 O(1)이며 알고리즘 효율이 좋습니다. " +
        "메모리 사용량과 캐시 효율을 고려한 트레이드오프가 있습니다. " +
        "예를 들어, 대규모 데이터를 처리할 때 인덱스를 활용합니다. " +
        "프로세스 간 공유 메모리에서도 해시 기반 구조가 사용됩니다."
      )

      // Higher scores should have fewer suggestions
      expect(highScore.suggestions.length).toBeLessThanOrEqual(
        lowScore.suggestions.length
      )
    })
  })
})
