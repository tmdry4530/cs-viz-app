/**
 * Monthly Report Generator (Mock)
 * Generates mock monthly learning report data in a Spotify Wrapped-style format.
 */

export interface MonthlyReportData {
  userId: string
  month: number
  year: number
  summary: {
    sessionsCompleted: number
    totalTimeMinutes: number
    quizAccuracy: number
    streakDays: number
    topTopic: string
    communityPosts: number
    communityReactions: number
  }
  categoryGrowth: CategoryGrowth[]
  dailyStreak: DailyStreak[]
  weeklyActivity: WeeklyActivity[]
  highlights: ReportHighlight[]
  comparison: MonthComparison
}

export interface CategoryGrowth {
  category: string
  score: number
  previousScore: number
  growth: number
}

export interface DailyStreak {
  date: string // YYYY-MM-DD
  active: boolean
  sessionsCount: number
}

export interface WeeklyActivity {
  week: number
  sessionsCompleted: number
  timeMinutes: number
  quizAccuracy: number
}

export interface ReportHighlight {
  type: "achievement" | "milestone" | "streak" | "improvement"
  title: string
  description: string
  value: string
}

export interface MonthComparison {
  sessionsChange: number // percentage
  timeChange: number
  accuracyChange: number
  streakChange: number
}

// --- Mock data pools ---

const CS_CATEGORIES = [
  "자료구조",
  "알고리즘",
  "운영체제",
  "네트워크",
  "데이터베이스",
  "시스템설계",
  "보안",
  "컴퓨터구조",
]

const TOP_TOPICS = [
  "해시테이블과 충돌 해결",
  "TCP/IP 프로토콜 스택",
  "프로세스 스케줄링",
  "B-트리 인덱싱",
  "동적 프로그래밍",
  "REST API 설계",
  "동시성 제어",
  "캐시 메모리 계층",
]

const HIGHLIGHT_TEMPLATES: ReportHighlight[] = [
  {
    type: "achievement",
    title: "퀴즈 마스터",
    description: "이번 달 퀴즈 정답률 80% 이상 달성!",
    value: "80%+",
  },
  {
    type: "milestone",
    title: "10회 학습 달성",
    description: "이번 달 10회 이상 학습 세션을 완료했어요.",
    value: "10+",
  },
  {
    type: "streak",
    title: "7일 연속 학습",
    description: "일주일 연속으로 학습한 대단한 집중력!",
    value: "7일",
  },
  {
    type: "improvement",
    title: "실력 급성장",
    description: "지난달 대비 학습 시간이 크게 늘었어요.",
    value: "+40%",
  },
  {
    type: "achievement",
    title: "커뮤니티 활동가",
    description: "커뮤니티에서 활발하게 활동했어요.",
    value: "5+",
  },
  {
    type: "milestone",
    title: "첫 리플렉션 작성",
    description: "처음으로 학습 리플렉션을 작성했어요!",
    value: "1st",
  },
  {
    type: "streak",
    title: "주말에도 학습",
    description: "주말에도 꾸준히 학습하는 습관이 인상적이에요.",
    value: "Weekend",
  },
  {
    type: "improvement",
    title: "약점 극복",
    description: "이전에 약했던 카테고리에서 큰 성장을 보였어요.",
    value: "+25%",
  },
]

// --- Utility ---

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const val = Math.random() * (max - min) + min
  return Number(val.toFixed(decimals))
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// --- Generator ---

function generateDailyStreak(year: number, month: number): DailyStreak[] {
  const daysInMonth = getDaysInMonth(year, month)
  const streaks: DailyStreak[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const active = Math.random() > 0.35
    streaks.push({
      date,
      active,
      sessionsCount: active ? randomInt(1, 3) : 0,
    })
  }

  return streaks
}

function generateCategoryGrowth(): CategoryGrowth[] {
  return CS_CATEGORIES.map((category) => {
    const previousScore = randomInt(30, 75)
    const score = Math.min(100, previousScore + randomInt(-5, 20))
    return {
      category,
      score,
      previousScore,
      growth: score - previousScore,
    }
  })
}

function generateWeeklyActivity(): WeeklyActivity[] {
  return [1, 2, 3, 4].map((week) => ({
    week,
    sessionsCompleted: randomInt(2, 8),
    timeMinutes: randomInt(30, 180),
    quizAccuracy: randomFloat(50, 95, 0),
  }))
}

function generateHighlights(): ReportHighlight[] {
  return pickRandomN(HIGHLIGHT_TEMPLATES, randomInt(2, 4))
}

/**
 * Generate a mock monthly report for the given user/month/year.
 */
export function generateMonthlyReport(
  userId: string,
  month: number,
  year: number
): MonthlyReportData {
  const dailyStreak = generateDailyStreak(year, month)
  const activeDays = dailyStreak.filter((d) => d.active).length
  const sessionsCompleted = dailyStreak.reduce(
    (sum, d) => sum + d.sessionsCount,
    0
  )

  const categoryGrowth = generateCategoryGrowth()
  const weeklyActivity = generateWeeklyActivity()

  // Find best category
  const bestCategory = [...categoryGrowth].sort(
    (a, b) => b.growth - a.growth
  )[0]

  return {
    userId,
    month,
    year,
    summary: {
      sessionsCompleted,
      totalTimeMinutes: sessionsCompleted * randomInt(15, 30),
      quizAccuracy: randomFloat(55, 92, 0),
      streakDays: activeDays,
      topTopic: TOP_TOPICS[randomInt(0, TOP_TOPICS.length - 1)],
      communityPosts: randomInt(0, 15),
      communityReactions: randomInt(0, 40),
    },
    categoryGrowth,
    dailyStreak,
    weeklyActivity,
    highlights: generateHighlights(),
    comparison: {
      sessionsChange: randomFloat(-20, 50, 0),
      timeChange: randomFloat(-15, 60, 0),
      accuracyChange: randomFloat(-10, 20, 0),
      streakChange: randomFloat(-5, 15, 0),
    },
  }
}
