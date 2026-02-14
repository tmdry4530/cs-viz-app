export interface Module {
  id: string
  title: string
  subtitle: string
  outcomes: string[]
  difficulty: string
  time: string
  tag: string
  color: string
}

export interface FeedPost {
  id: string
  author: string
  avatar: string
  module: string
  score: number
  duration: string
  badge: string
  summary: string
  likes: number
  comments: number
  createdAt: string
}

export const modules: Module[] = [
  {
    id: "http-journey",
    title: "HTTP 요청 한 번에 서버에서 일어나는 일",
    subtitle: "DNS → TCP → TLS → LB → App → DB → Response",
    outcomes: [
      "왜 502/타임아웃이 나는지 설명할 수 있음",
      "재시도 폭풍이 왜 장애를 키우는지 이해",
      "로그에서 병목 지점을 찾는 기본 감각",
    ],
    difficulty: "초급~중급",
    time: "30분",
    tag: "Network",
    color: "hsl(197, 71%, 53%)",
  },
  {
    id: "concurrency",
    title: "이벤트루프 vs 스레드: 왜 멈추고, 왜 꼬이나",
    subtitle: "큐, 락, 경합, 데드락을 눈으로 보기",
    outcomes: [
      "경합/락이 성능을 망치는 구조를 설명",
      "데드락 조건을 사례로 말할 수 있음",
      "비동기 모델의 장단점을 구분",
    ],
    difficulty: "중급",
    time: "30분",
    tag: "OS/Concurrency",
    color: "hsl(47, 96%, 53%)",
  },
  {
    id: "git-pr",
    title: "git이 갑자기 어려워지는 이유: 3영역과 PR",
    subtitle: "working tree / index / commit + rebase/merge",
    outcomes: [
      "add/commit이 뭔지 그림으로 설명",
      "rebase vs merge 차이를 상황별로 선택",
      "충돌 해결 흐름을 멘탈모델로 이해",
    ],
    difficulty: "초급",
    time: "30분",
    tag: "DevTools",
    color: "hsl(142, 71%, 45%)",
  },
]

export const feedPosts: FeedPost[] = [
  {
    id: "1",
    author: "김서연",
    avatar: "SE",
    module: "HTTP 요청의 여정",
    score: 92,
    duration: "28분",
    badge: "Network 마스터",
    summary:
      "DNS 리졸버가 캐시를 먼저 확인하고, TLS 핸드셰이크에서 인증서 검증 순서가 중요하다는 걸 처음 알았습니다. 로드밸런서가 요청을 분배하는 방식이 라운드로빈만 있는 게 아니라는 것도 신선했어요.",
    likes: 24,
    comments: 8,
    createdAt: "2시간 전",
  },
  {
    id: "2",
    author: "이준호",
    avatar: "JH",
    module: "동시성/비동기 직관",
    score: 85,
    duration: "31분",
    badge: "Concurrency 탐험가",
    summary:
      "데드락이 발생하는 4가지 조건(상호배제, 점유대기, 비선점, 순환대기)을 시각적으로 보니까 확 이해됐습니다. 특히 Node.js 이벤트루프에서 setTimeout(0)이 왜 즉시 실행되지 않는지 드디어 알게 됐어요.",
    likes: 18,
    comments: 5,
    createdAt: "5시간 전",
  },
  {
    id: "3",
    author: "박민지",
    avatar: "MJ",
    module: "Git 3영역 + PR 루프",
    score: 95,
    duration: "26분",
    badge: "Git 마스터",
    summary:
      "working tree → index → commit의 흐름을 3영역 다이어그램으로 보니까 git add와 git commit이 왜 분리되어 있는지 이해했습니다. rebase vs merge는 팀 컨벤션에 따라 선택해야 한다는 점도 좋았어요.",
    likes: 31,
    comments: 12,
    createdAt: "1일 전",
  },
]

export const sessionStages = [
  { id: "viz", label: "Viz", duration: "12분", minutes: 12 },
  { id: "quiz", label: "퀴즈", duration: "7분", minutes: 7 },
  { id: "apply", label: "실무 적용", duration: "6분", minutes: 6 },
  { id: "reflection", label: "3문장 설명", duration: "3분", minutes: 3 },
] as const

export type StageId = (typeof sessionStages)[number]["id"]
