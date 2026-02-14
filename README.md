# CS Viz - 30분 CS 기초 트레이닝

비전공자를 위한 CS 기초 시각화 학습 플랫폼. 매일 30분, 인터랙티브 시각화로 CS를 이해합니다.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.7
- **UI**: React 19, Tailwind CSS 3, shadcn/ui, Radix UI
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (Google OAuth + Credentials)
- **Visualization**: Custom React state machine + CSS animations
- **Charts**: Recharts
- **Testing**: Jest, Testing Library, Playwright

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd cs-viz-app
npm install --legacy-peer-deps

# 2. Environment variables
cp .env.example .env

# 3. Start PostgreSQL
docker-compose up -d

# 4. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Dev Login

Use the "개발용 계정으로 로그인" button on the login page (dev mode only):
- Email: test@test.com
- Password: test1234

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/login/       # Login page
│   ├── api/                # API routes
│   ├── community/          # Community feed page
│   ├── modules/            # Module library page
│   ├── profile/            # User profile page
│   ├── session/[id]/       # Learning session page
│   └── share/[id]/         # Share card page
├── components/
│   ├── community/          # Community feed components
│   ├── session/            # Session player components
│   ├── ui/                 # shadcn/ui components
│   └── viz/                # Visualization engine
│       ├── use-viz-engine.ts    # State machine hook
│       ├── viz-engine.tsx       # Router component
│       ├── http-journey.tsx     # HTTP request flow viz
│       ├── concurrency-viz.tsx  # Event loop vs threads viz
│       └── git-areas-viz.tsx    # Git 3-areas viz
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities
│   ├── auth.ts             # NextAuth config
│   ├── data.ts             # Module/session data
│   ├── prisma.ts           # Prisma client
│   ├── rate-limit.ts       # API rate limiting
│   ├── sanitize.ts         # XSS prevention
│   ├── utils.ts            # Tailwind cn() helper
│   └── validations.ts      # Zod schemas
└── types/                  # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Jest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Modules

1. **HTTP 요청의 여정** - DNS, TCP, TLS, Load Balancer, App Server, Database flow
2. **이벤트루프 vs 스레드** - Event loop, call stack, queues, threads, locks, deadlock
3. **Git 3영역 + PR** - Working tree, index, commits, branches, PR workflow

Each module includes:
- Interactive visualization (12 min)
- Quiz (7 min)
- Apply task (6 min)
- 3-sentence reflection (3 min)

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests (requires dev server running)
npm run test:e2e
```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret |
| `NEXTAUTH_URL` | Yes | App URL (http://localhost:3000) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |

## License

Private
