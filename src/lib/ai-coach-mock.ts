/**
 * Mock AI Coach Service
 * Pre-defined Korean response pools for feedback, follow-up questions, and analysis.
 */

// --- Feedback Templates ---

const FEEDBACK_TEMPLATES = [
  "좋은 설명이에요! 핵심 개념을 잘 잡았습니다. 다만, 실제 사용 사례를 하나 더 추가하면 이해가 더 깊어질 거예요.",
  "전반적으로 잘 정리했어요. 한 가지 팁을 드리자면, '왜 이 개념이 중요한지'를 먼저 언급하면 설명력이 크게 올라갑니다.",
  "설명이 명확하고 간결해요. 비유를 활용하면 더 효과적인 설명이 될 수 있어요. 예를 들어 일상 속 비슷한 패턴을 찾아보세요.",
  "핵심을 잘 짚었어요! 다음 단계로, 이 개념이 다른 개념과 어떻게 연결되는지 설명해보면 좋겠어요.",
  "잘 작성했습니다. 좀 더 구체적인 코드 예시를 들어보면 실무 이해도가 높아질 거예요.",
  "논리적으로 잘 구성했어요. 한 가지 보완할 점은, 이 개념의 한계나 트레이드오프도 함께 언급하면 깊이가 더해집니다.",
  "좋은 시작이에요! 설명에 '문제 상황 -> 해결 방법' 구조를 적용하면 더 설득력 있는 설명이 됩니다.",
  "핵심 포인트를 잘 잡았어요. 면접에서 이 주제가 나오면, 시간/공간 복잡도 관점에서도 설명할 수 있으면 좋겠어요.",
  "설명이 체계적이에요. 추가로, 이 개념이 실제 서비스에서 어떤 문제를 해결하는지 사례를 들어보세요.",
  "잘 정리했습니다! 이 개념을 처음 듣는 사람에게 설명한다고 가정하고, 첫 문장을 좀 더 쉽게 바꿔보면 어떨까요?",
  "깔끔한 설명이에요. 다음에는 다이어그램이나 순서도로 표현해보는 연습도 해보세요.",
  "핵심을 잘 파악했어요! 이 개념과 자주 혼동되는 유사 개념과의 차이점도 정리해보면 도움이 될 거예요.",
]

const FOLLOW_UP_POOLS: Record<string, string[]> = {
  default: [
    "이 개념이 실제 프로덕션 환경에서 어떤 문제를 일으킬 수 있을까요?",
    "이 개념을 사용하지 않으면 어떤 대안이 있을까요?",
    "이 개념의 시간 복잡도와 공간 복잡도는 각각 어떻게 되나요?",
    "면접관이 이 주제에 대해 꼬리질문을 한다면 어떤 질문이 나올까요?",
    "이 개념이 적용된 실제 오픈소스 프로젝트 사례를 알고 있나요?",
    "이 개념을 비개발자에게 1분 안에 설명한다면 어떻게 하시겠어요?",
    "이 접근 방식의 트레이드오프(장단점)를 정리해볼 수 있나요?",
    "이 개념이 등장하게 된 역사적 배경이나 동기는 무엇인가요?",
    "이 개념을 테스트하려면 어떤 테스트 케이스를 작성해야 할까요?",
    "이 개념과 관련된 디자인 패턴이나 원칙이 있을까요?",
  ],
  "자료구조": [
    "이 자료구조의 삽입/삭제/검색 시간 복잡도를 비교해볼 수 있나요?",
    "이 자료구조가 다른 자료구조보다 유리한 구체적인 상황은 무엇인가요?",
    "메모리 사용 관점에서 이 자료구조의 오버헤드는 어떤가요?",
  ],
  "알고리즘": [
    "이 알고리즘의 최선/평균/최악 케이스를 각각 설명해볼 수 있나요?",
    "이 알고리즘을 최적화할 수 있는 방법이 있을까요?",
    "이 알고리즘이 적합하지 않은 입력 패턴은 무엇인가요?",
  ],
  "네트워크": [
    "이 프로토콜이 없다면 인터넷은 어떻게 동작할까요?",
    "보안 관점에서 이 프로토콜의 취약점은 무엇인가요?",
    "이 개념이 실제 웹 서비스 성능에 미치는 영향은?",
  ],
  "운영체제": [
    "이 개념이 멀티코어 환경에서 어떻게 달라지나요?",
    "데드락이 발생하는 조건 네 가지를 모두 설명할 수 있나요?",
    "가상 메모리가 없다면 어떤 문제가 생길까요?",
  ],
  "데이터베이스": [
    "이 개념이 대규모 트래픽 환경에서 성능에 미치는 영향은?",
    "인덱스를 추가하면 항상 좋은 건 아닌데, 언제 인덱스가 오히려 해가 될까요?",
    "정규화와 반정규화의 트레이드오프를 실무 관점에서 설명해볼 수 있나요?",
  ],
}

const ANALYSIS_SUGGESTIONS = [
  "핵심 키워드를 먼저 언급하고 부연 설명을 추가하면 더 명확해집니다.",
  "구체적인 예시나 코드를 포함하면 설명력이 향상됩니다.",
  "비교/대조를 통한 설명이 이해를 돕습니다.",
  "'왜'에 대한 설명이 부족합니다. 동기와 배경을 추가해보세요.",
  "설명이 추상적입니다. 실제 사용 사례를 들어보세요.",
  "문장이 길어지면 이해가 어려워집니다. 짧은 문장으로 나눠보세요.",
  "전문 용어를 사용할 때는 간단한 정의도 함께 제공하면 좋습니다.",
  "설명의 순서를 '개념 -> 동작 원리 -> 사용 예시'로 구조화해보세요.",
]

// --- Utility ---

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function computeMockScore(text: string): number {
  let score = 40 // base
  const len = text.length

  // Length bonus (up to 20 points)
  if (len > 200) score += 20
  else if (len > 100) score += 15
  else if (len > 50) score += 10

  // Sentence count bonus (up to 15 points)
  const sentences = text.split(/[.!?。]\s*/).filter((s) => s.trim().length > 0)
  if (sentences.length >= 5) score += 15
  else if (sentences.length >= 3) score += 10
  else if (sentences.length >= 2) score += 5

  // Technical keyword bonus (up to 15 points)
  const techKeywords = [
    "시간복잡도", "공간복잡도", "O(", "알고리즘", "자료구조",
    "트레이드오프", "캐시", "메모리", "스레드", "프로세스",
    "인덱스", "쿼리", "API", "HTTP", "TCP", "UDP",
    "해시", "트리", "그래프", "정렬", "탐색",
  ]
  const keywordCount = techKeywords.filter((kw) =>
    text.toLowerCase().includes(kw.toLowerCase())
  ).length
  score += Math.min(keywordCount * 3, 15)

  // Example/code bonus (up to 10 points)
  if (text.includes("예를 들어") || text.includes("예시") || text.includes("```")) {
    score += 10
  }

  return Math.min(score, 100)
}

function detectTopic(text: string): string {
  const topicKeywords: Record<string, string[]> = {
    "자료구조": ["배열", "리스트", "트리", "그래프", "해시", "스택", "큐", "힙"],
    "알고리즘": ["정렬", "탐색", "재귀", "DP", "그리디", "분할정복", "BFS", "DFS"],
    "네트워크": ["HTTP", "TCP", "UDP", "DNS", "IP", "소켓", "프로토콜", "패킷"],
    "운영체제": ["프로세스", "스레드", "메모리", "스케줄링", "데드락", "가상메모리", "컨텍스트스위칭"],
    "데이터베이스": ["인덱스", "쿼리", "트랜잭션", "정규화", "SQL", "조인", "ACID"],
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))) {
      return topic
    }
  }
  return "default"
}

// --- Public API ---

export interface FeedbackResult {
  feedback: string
  encouragement: string
}

export interface FollowUpResult {
  questions: string[]
}

export interface AnalysisResult {
  score: number
  grade: string
  suggestions: string[]
  strengths: string[]
}

function getGrade(score: number): string {
  if (score >= 90) return "S"
  if (score >= 80) return "A"
  if (score >= 70) return "B"
  if (score >= 60) return "C"
  if (score >= 50) return "D"
  return "F"
}

const ENCOURAGEMENTS = [
  "계속 이 페이스로 학습하면 면접 준비 끝!",
  "꾸준한 복습이 실력의 차이를 만듭니다.",
  "오늘도 한 걸음 성장했어요!",
  "이 개념을 정리한 것만으로도 큰 진전이에요.",
  "내일은 오늘보다 더 깊이 이해할 수 있을 거예요.",
]

const STRENGTH_TEMPLATES = [
  "핵심 개념을 정확히 파악하고 있습니다.",
  "논리적인 흐름이 잘 갖춰져 있어요.",
  "실제 사례를 잘 연결시켰습니다.",
  "간결하면서도 핵심을 담은 설명이에요.",
  "용어를 정확하게 사용하고 있습니다.",
]

/**
 * Generate feedback for a reflection text.
 */
export function generateFeedback(reflection: string): FeedbackResult {
  return {
    feedback: pickRandom(FEEDBACK_TEMPLATES),
    encouragement: pickRandom(ENCOURAGEMENTS),
  }
}

/**
 * Generate follow-up questions based on topic and context.
 */
export function generateFollowUp(topic: string, context: string): FollowUpResult {
  const detectedTopic = detectTopic(topic + " " + context)
  const pool = [
    ...(FOLLOW_UP_POOLS[detectedTopic] || []),
    ...FOLLOW_UP_POOLS.default,
  ]
  return {
    questions: pickRandomN(pool, 3),
  }
}

/**
 * Analyze an explanation text and return score, grade, suggestions, strengths.
 */
export function analyzeExplanation(text: string): AnalysisResult {
  const score = computeMockScore(text)
  const grade = getGrade(score)
  const suggestionCount = score >= 80 ? 1 : score >= 60 ? 2 : 3
  const strengthCount = score >= 80 ? 3 : score >= 60 ? 2 : 1

  return {
    score,
    grade,
    suggestions: pickRandomN(ANALYSIS_SUGGESTIONS, suggestionCount),
    strengths: pickRandomN(STRENGTH_TEMPLATES, strengthCount),
  }
}
