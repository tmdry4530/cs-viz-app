export interface GraphNode {
  id: string
  label: string
  category: string
  moduleId?: string // maps to existing module if available
  x: number
  y: number
}

export interface GraphEdge {
  from: string
  to: string
}

export const categories = {
  networking: { label: "네트워킹", color: "hsl(197, 71%, 53%)" },
  concurrency: { label: "동시성/OS", color: "hsl(47, 96%, 53%)" },
  "version-control": { label: "버전 관리", color: "hsl(142, 71%, 45%)" },
  "data-structures": { label: "자료구조", color: "hsl(280, 65%, 60%)" },
  "os-basics": { label: "OS 기초", color: "hsl(15, 80%, 55%)" },
} as const

export type Category = keyof typeof categories

export const graphNodes: GraphNode[] = [
  // Networking cluster (left side)
  { id: "tcp-ip", label: "TCP/IP", category: "networking", x: 100, y: 80 },
  { id: "dns", label: "DNS", category: "networking", x: 60, y: 180 },
  { id: "http", label: "HTTP", category: "networking", moduleId: "http-journey", x: 180, y: 200 },
  { id: "tls", label: "TLS/HTTPS", category: "networking", x: 280, y: 140 },
  { id: "load-balancer", label: "로드밸런서", category: "networking", x: 300, y: 260 },

  // Concurrency cluster (center)
  { id: "event-loop", label: "이벤트루프", category: "concurrency", moduleId: "concurrency", x: 480, y: 100 },
  { id: "thread", label: "스레드", category: "concurrency", x: 560, y: 200 },
  { id: "mutex", label: "뮤텍스/락", category: "concurrency", x: 640, y: 120 },
  { id: "deadlock", label: "데드락", category: "concurrency", x: 720, y: 220 },

  // OS basics cluster (center-bottom)
  { id: "os-process", label: "프로세스", category: "os-basics", x: 420, y: 320 },
  { id: "memory", label: "메모리 관리", category: "os-basics", x: 540, y: 380 },
  { id: "cache", label: "캐시", category: "os-basics", x: 360, y: 420 },

  // Data structures cluster (right-bottom)
  { id: "stack", label: "스택", category: "data-structures", x: 700, y: 340 },
  { id: "queue", label: "큐", category: "data-structures", x: 780, y: 420 },
  { id: "hash-table", label: "해시 테이블", category: "data-structures", x: 660, y: 460 },

  // Version control cluster (right)
  { id: "git", label: "Git 기초", category: "version-control", moduleId: "git-pr", x: 150, y: 380 },
  { id: "branch", label: "브랜치", category: "version-control", x: 80, y: 460 },
  { id: "merge", label: "머지", category: "version-control", x: 200, y: 500 },
  { id: "rebase", label: "리베이스", category: "version-control", x: 300, y: 460 },
]

export const graphEdges: GraphEdge[] = [
  // Networking prerequisites
  { from: "tcp-ip", to: "http" },
  { from: "tcp-ip", to: "dns" },
  { from: "tcp-ip", to: "tls" },
  { from: "http", to: "tls" },
  { from: "http", to: "load-balancer" },

  // Concurrency prerequisites
  { from: "os-process", to: "thread" },
  { from: "thread", to: "event-loop" },
  { from: "thread", to: "mutex" },
  { from: "mutex", to: "deadlock" },

  // OS basics
  { from: "os-process", to: "memory" },
  { from: "memory", to: "cache" },

  // Data structures -> concurrency connection
  { from: "queue", to: "event-loop" },
  { from: "stack", to: "os-process" },

  // Version control
  { from: "git", to: "branch" },
  { from: "branch", to: "merge" },
  { from: "branch", to: "rebase" },
]

/**
 * Get node by ID
 */
export function getNode(id: string): GraphNode | undefined {
  return graphNodes.find((n) => n.id === id)
}

/**
 * Get prerequisite nodes for a given node (nodes that have edges TO this node)
 */
export function getPrerequisites(nodeId: string): GraphNode[] {
  const prereqIds = graphEdges
    .filter((e) => e.to === nodeId)
    .map((e) => e.from)
  return graphNodes.filter((n) => prereqIds.includes(n.id))
}

/**
 * Get nodes that depend on a given node (nodes this node has edges TO)
 */
export function getDependents(nodeId: string): GraphNode[] {
  const depIds = graphEdges
    .filter((e) => e.from === nodeId)
    .map((e) => e.to)
  return graphNodes.filter((n) => depIds.includes(n.id))
}
