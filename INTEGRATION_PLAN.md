# CS Viz App - Integration Plan

## 1. ui-v0 분석 요약

| 항목 | 내용 |
|------|------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Design System | shadcn/ui (default style, neutral base), Tailwind CSS 3.4 |
| Theme | Dark mode default, primary=green hsl(142,71%,45%), Geist font |
| CSS Variables | 50+ custom properties (light/dark), chart colors, sidebar tokens |
| UI Primitives | 35+ shadcn/ui components (Accordion~Tooltip) |
| Pages | Landing(/), Modules(/modules), Session(/session/[id]), Community(/community), Share(/share/[id]), Profile(/profile) |
| Custom Components | NavHeader, LandingHero, HowItWorks, FeaturedModules, SessionPlayerShell, VizCanvas(placeholder), VizControls, StageTabs, QuizCard, ApplyTaskCard, ReflectionComposer, CommunityFeed, FeedPost, CommentThread, ShareCard, ProfileView, ModuleCard, ModulesLibrary |
| Data | 3 modules (HTTP/Concurrency/Git), mock feed posts, session stages (viz/quiz/apply/reflection) |
| Icon Library | lucide-react |

## 2. 통합 전략

### 원칙
- ui-v0/ 폴더는 **절대 수정/삭제 금지** (참조 전용)
- ui-v0 컴포넌트를 프로젝트 루트로 **복사 후 적응** (import path 변경)
- CSS variables, tailwind config, design tokens **그대로 보존**
- Mock data → Prisma DB 쿼리로 점진적 교체

### 폴더 구조 (Target)

```
cs-viz-app/
├── ui-v0/                    # 원본 보존 (READ-ONLY)
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (from ui-v0)
│   │   ├── page.tsx          # Landing (from ui-v0)
│   │   ├── globals.css       # CSS variables (from ui-v0)
│   │   ├── (auth)/           # Auth pages
│   │   │   └── login/page.tsx
│   │   ├── modules/page.tsx
│   │   ├── session/[id]/page.tsx
│   │   ├── community/page.tsx
│   │   ├── share/[id]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── api/              # API Routes
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── sessions/route.ts
│   │       ├── quiz/route.ts
│   │       ├── apply/route.ts
│   │       ├── reflection/route.ts
│   │       ├── community/route.ts
│   │       ├── comments/route.ts
│   │       ├── reactions/route.ts
│   │       ├── reports/route.ts
│   │       └── share/route.ts
│   ├── components/           # Copied from ui-v0 + adapted
│   │   ├── ui/               # shadcn primitives (as-is)
│   │   ├── session/          # Session player components
│   │   ├── community/        # Community components
│   │   ├── viz/              # NEW: Visualization engines
│   │   │   ├── viz-engine.tsx
│   │   │   ├── http-journey.tsx
│   │   │   ├── concurrency-viz.tsx
│   │   │   └── git-areas-viz.tsx
│   │   └── ...               # Other ui-v0 components
│   ├── lib/
│   │   ├── utils.ts          # cn() from ui-v0
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── validations.ts    # Zod schemas
│   │   └── rate-limit.ts     # Rate limiter
│   ├── hooks/                # from ui-v0
│   └── types/                # Shared types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
├── .env.example
├── tailwind.config.ts        # from ui-v0
├── next.config.mjs
├── jest.config.ts
├── playwright.config.ts
└── package.json
```

## 3. 통합 패치 목록

| # | 대상 | 변경 내용 | 이유 |
|---|------|----------|------|
| 1 | import paths | `@/` → `@/` (동일, src/ 기준으로 조정) | src/ 디렉토리 사용 |
| 2 | layout.tsx | ThemeProvider, SessionProvider 래핑 추가 | Auth + Theme 지원 |
| 3 | nav-header.tsx | 로그인 버튼 → NextAuth signIn/signOut 연결 | 실제 auth 연동 |
| 4 | lib/data.ts | Mock data 유지 + DB fallback 패턴 | 점진적 마이그레이션 |
| 5 | session-player-shell.tsx | API 호출 추가, 진행률 저장 로직 | 실제 세션 기록 |
| 6 | viz-canvas.tsx | Placeholder → 실제 viz engine 교체 | 핵심 기능 |
| 7 | quiz-card.tsx | API 연동, 채점 로직 추가 | 실제 퀴즈 기능 |
| 8 | community-feed.tsx | API fetch로 교체, 무한 스크롤 | 실제 피드 |
| 9 | share-card.tsx | OG image generation, 공유 URL | 공유 기능 |
| 10 | globals.css | 그대로 복사 (변경 없음) | 디자인 토큰 보존 |

## 4. P0 실행 계획 (3 워크스트림)

### Stream 1: Backend & Infrastructure
- Next.js 프로젝트 부트스트랩 (create-next-app)
- Prisma 스키마 (12 모델)
- docker-compose.yml (Postgres)
- .env.example
- DB 마이그레이션 + seed

### Stream 2: Frontend Integration
- ui-v0 컴포넌트 복사 + 경로 적응
- Viz 엔진 구현 (HTTP/Concurrency/Git)
- 세션 플레이어 로직 (타이머, 진행률, 체크포인트)
- 퀴즈/Apply/Reflection 인터랙션

### Stream 3: Auth, Security & Community
- NextAuth (Google OAuth + local dev fallback)
- API middleware (auth, rate limit, validation)
- Community API (feed, comments, reactions, reports)
- Share/OG card generation
- XSS 방어, input sanitization

## 5. Quality Gates

- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] E2E: login → session → share → comment (local mode)
- [ ] Security: rate limits, input validation, XSS-safe
- [ ] ui-v0 design preserved
- [ ] INTEGRATION_NOTES.md complete
