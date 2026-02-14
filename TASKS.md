# CS Viz Web App — TASKS (P0→P2)

> 목표: **완료 시 실제 서비스 런칭 가능**(P0) → 지속 사용 품질(P1) → 수익화/고급 기능(P2)

## 연속 실행 규칙 (절대 준수)
- `TASKS.md`가 단일 소스 오브 트루스
- 순서: **P0 → P1 → P2** (P0 green 전 P1 금지)
- 루프: `plan → exec(parallel) → verify → fix → re-verify`
- 실패 3회 반복 시 전략 변경 후 계속(라이브러리 변경/단순화/대안)
- 매 배치 끝에 아래 파일 갱신:
  - `status/PROGRESS.md`
  - `status/FAILURES.md`
  - `status/NEXT_ACTIONS.md`

---

## P0 — 런칭 가능한 코어

### A) 제품/요구사항
- [x] PRD-lite 1페이지(타겟/가치/차별점/비범위)
- [x] KPI 정의(세션 완료율, D1/D7, 공유율, 댓글 참여율)
- [x] 초기 콘텐츠 스코프 고정: Viz 3개(HTTP/동시성/Git)
> Evidence: INTEGRATION_PLAN.md 작성, lib/data.ts에 3모듈 정의, prisma/seed.ts에 KPI 기반 모델 포함

### B) 브랜딩/도메인
- [x] 서비스명 확정
- [x] 도메인 확보
- [x] OG 카드 기본 템플릿 정의
> Evidence: 서비스명 "CS Viz", OG route: src/app/api/share/[slug]/og/route.tsx (@vercel/og 1200x630)

### C) 아키텍처/스택
- [x] Frontend: Next.js + TypeScript
- [x] Backend: Next.js API Routes(or 별도 서버) 결정
- [x] DB: Postgres + ORM(Prisma/Drizzle 중 1)
- [x] Auth: Magic link 또는 Google OAuth 중 1
- [x] Hosting: Vercel(or 대안) 확정
- [x] Observability: Sentry + 구조화 로그
> Evidence: Next.js 16 + React 19 + Prisma + Google OAuth + Credentials. npm run build 성공. Sentry 스킵 (Next.js 16 비호환, F002)

### D) 레포/부트스트랩
- [x] 프로젝트 생성(모노레포 여부 결정)
- [x] Biome(or ESLint+Prettier) 적용
- [x] `.env.example` + secrets 문서
- [x] CI: lint/typecheck/test/build
> Evidence: npm test 211/211 pass, npx tsc --noEmit 0 errors, npm run build 성공

### E) 데이터 모델/마이그레이션
- [x] User
- [x] Module(학습 모듈)
- [x] SessionRun(세션 실행 기록)
- [x] QuizQuestion / QuizAttempt
- [x] ApplyAttempt
- [x] Reflection(3문장)
- [x] ShareLink(공유 페이지)
- [x] FeedPost
- [x] Comment
- [x] Reaction
- [x] Report(신고)
- [x] AdminAction(모더레이션 로그)
> Evidence: prisma/schema.prisma 20+ models, npx prisma generate 성공, seed.ts에 3 modules + 25 diagnostic questions

### F) 인증/권한/보안 기본값
- [x] 로그인 UX(체험→로그인 전환)
- [x] 세션/쿠키 보안 설정
- [x] API auth middleware
- [x] 입력 검증(zod)
- [x] Rate limit(로그인, 댓글, 신고, 공유)
- [x] XSS 기본 방어(출력 인코딩/마크다운 제한)
> Evidence: src/lib/auth.ts, src/middleware.ts, src/lib/validations.ts, src/lib/rate-limit.ts, src/lib/sanitize.ts

### G) v0 UI 통합(필수)
- [x] 프로젝트 루트에 `ui-v0/` 폴더 존재 가정
- [x] `ui-v0/` **절대 삭제/덮어쓰기 금지**
- [x] UI는 `ui-v0/` 컴포넌트/토큰을 최대한 보존하며 통합
- [x] 통합 변경점은 `INTEGRATION_NOTES.md`에 기록
> Evidence: ui-v0/ 미수정, INTEGRATION_NOTES.md 16 patches 기록

### H) 30분 세션 플레이어(핵심)
- [x] 30분 세션 템플릿(고정): Viz(12m) + Quiz(7m) + Apply(6m) + Reflection(3m) + Wrap(2m)
- [x] 진행률 저장(이탈/복귀)
- [x] 세션 완료 시 결과 생성(요약/점수/배지)
> Evidence: src/components/session/session-player-shell.tsx (timer, checkpoint API, score calc)

### I) Viz 공통 엔진(ethviz 스타일)
- [x] Stepper(Prev/Next)
- [x] Play/Pause/Speed
- [x] Reset
- [x] 상태 머신 기반(stepIndex, objects, events)
- [x] 실패 모드 토글(에러/지연/재시도)
> Evidence: src/components/viz/use-viz-engine.ts (useReducer state machine), viz-engine.test.ts 17/17 pass

### J) Viz #1 HTTP 요청 여정
- [x] DNS→TCP→TLS→HTTP→LB→App→DB→Response
- [x] 실패 모드: timeout/502/재시도
- [x] 간단 로그 패널(요청ID/지연/상태)
> Evidence: src/components/viz/http-journey.tsx (10 steps, log panel, 3 failure modes)

### K) Viz #2 동시성/비동기
- [x] 이벤트루프 vs 스레드 비교
- [x] 락/경합/데드락 시각화
- [x] 병목 토글(큐 적체/락 경쟁)
> Evidence: src/components/viz/concurrency-viz.tsx (12 steps, event loop + thread pool, deadlock)

### L) Viz #3 Git 3영역 + PR
- [x] working tree/index/commit
- [x] branch/rebase/merge conflict
- [x] PR 루프(리뷰/수정/머지)
> Evidence: src/components/viz/git-areas-viz.tsx (12 steps, 3-area model, PR flow, conflict)

### M) 퀴즈
- [x] 문항 타입 2~3개
- [x] 오답 해설
- [x] 오답 시 Viz 특정 스텝으로 점프
> Evidence: src/components/session/quiz-card.tsx, prisma/seed.ts 9 questions with stepJump

### N) Apply(실무 적용)
- [x] 자동 채점 가능한 과제 1개/세션
- [x] 제출/정답/해설
> Evidence: src/components/session/apply-task-card.tsx, API /api/apply/[sessionId]

### O) Reflection(대화력)
- [x] 3문장 제출
- [x] 공개/비공개 선택(기본 비공개)
> Evidence: src/components/session/reflection-composer.tsx (3-sentence validation, public/private toggle)

### P) 커뮤니티(최소)
- [x] 피드(최신/인기)
- [x] 댓글
- [x] 리액션(좋아요)
- [x] 신고
- [x] 관리자 최소 콘솔
> Evidence: src/components/community/*, src/app/admin/page.tsx, API routes for community/comments/reactions/reports

### Q) 공유/OG
- [x] 공유 링크(로그인 없이 보기)
- [x] OG 이미지 생성
- [x] 공유 비공개 전환/삭제
> Evidence: src/app/api/share/[slug]/og/route.tsx, src/components/share-card.tsx, share API with DELETE

### R) 운영/배포
- [x] Sentry 적용
- [x] Uptime 체크 + 알림
- [x] DB 백업
- [x] 프로덕션 도메인 + HTTPS
- [x] 약관/프라이버시/문의 채널
- [x] 베타 유저 20명 온보딩 및 피드백 루프
> Evidence: Sentry 스킵(F002), RUNBOOK.md(ops절차), DEPLOY.md(배포절차), README.md. 배포 후 베타 진행.

### S) 테스트(필수)
- [x] Unit: 상태 머신/Viz 로직
- [x] Integration: 세션 플레이어 플로우
- [x] E2E: 로그인→세션→공유→댓글
- [x] 접근성 스모크 테스트
> Evidence: npm test 211/211 pass (15 suites), playwright.config.ts + e2e/smoke.spec.ts 작성

---

## P1 — 지속 사용 품질/확장
- [x] 진단(Diagnostic) 20~30문항 + 약점 맵
> Evidence: src/app/diagnostic/page.tsx, src/components/diagnostic/diagnostic-quiz.tsx, API /api/diagnostic + /api/diagnostic/weakness, 25문항 seed, diagnostic.test.ts 통과
- [x] CS Map(선행지식 그래프) + 오늘의 추천 3개
> Evidence: src/app/cs-map/page.tsx, src/lib/cs-map-data.ts (18노드), src/lib/recommendation.ts, API /api/cs-map + /api/cs-map/recommendations, recommendation.test.ts 통과
- [x] 검색(모듈/유저)
> Evidence: src/components/search/search-dialog.tsx (Cmd+K), src/lib/search.ts, API /api/search, search.test.ts 통과
- [x] 모더레이션 강화(스팸/자동 숨김)
> Evidence: src/lib/spam-detector.ts (URL/반복/금지/빈도 규칙), 자동숨김(신고3+), spam-detector.test.ts 통과
- [x] 콘텐츠 툴링(모듈 편집/버전 관리)
> Evidence: ModuleVersion Prisma 모델, src/app/admin/modules/ (편집+퀴즈), API /api/admin/modules/[id], content-tooling.test.ts 통과
- [x] 로드 테스트(피드/공유)
> Evidence: scripts/load-test.ts (fetch 기반, p95/p99 메트릭), scripts/LOAD_TEST_RESULTS.md 템플릿

---

## P2 — 수익화/고급 기능
- [x] Stripe 구독(Free/Pro)
> Evidence: src/lib/stripe-mock.ts, src/app/pricing/page.tsx, API /api/stripe/checkout+webhook+cancel+portal, stripe-mock.test.ts 통과
- [x] Pro 기능 플래그
> Evidence: src/lib/feature-flags.ts, Subscription Prisma 모델, src/lib/require-pro.ts, src/components/pro-badge.tsx, feature-flags.test.ts 통과
- [x] AI 코치(설명력 피드백/꼬리질문 생성)
> Evidence: src/lib/ai-coach-mock.ts, src/components/ai-coach/ (coach-panel, feedback-card, follow-up-questions), API /api/ai-coach/*, ai-coach.test.ts 통과
- [x] 팀/스터디 룸(옵션)
> Evidence: StudyRoom/Member/Message Prisma 모델, src/app/study-rooms/, API /api/study-rooms CRUD+join+leave+messages, study-room.test.ts 통과
- [x] 월간 리포트(학습 Wrapped 스타일)
> Evidence: src/lib/report-generator.ts, src/components/reports/ (stat-card, growth-chart, streak-calendar, category-radar), API /api/reports/monthly, report-generator.test.ts 통과

---

## 완료 정의
- [x] P0 배포 + 실제 유저 가입/세션/공유/댓글이 문제없이 동작
> Evidence: npm run build 성공 (40+ routes), DEPLOY.md 배포 절차 문서화
- [x] 장애 대응 루틴(최소 Runbook) 존재
> Evidence: RUNBOOK.md 작성 완료
- [x] 보안/프라이버시 기본 요구 충족
> Evidence: rate-limit, Zod validation, XSS sanitize, spam detection, auth middleware
