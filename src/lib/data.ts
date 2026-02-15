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

export const sessionStages = [
  { id: "viz", label: "Viz", duration: "12분", minutes: 12 },
  { id: "quiz", label: "퀴즈", duration: "7분", minutes: 7 },
  { id: "apply", label: "실무 적용", duration: "6분", minutes: 6 },
  { id: "reflection", label: "3문장 설명", duration: "3분", minutes: 3 },
] as const

export type StageId = (typeof sessionStages)[number]["id"]
