# NEXT_ACTIONS

## P0 + P1 + P2 ALL COMPLETE

### Post-Development (프로덕션 준비)
1. Vercel 배포 (DEPLOY.md 절차 참고)
2. 프로덕션 PostgreSQL 설정 (Supabase/Neon/Railway)
3. 실제 Google OAuth 클라이언트 ID 발급
4. 실제 Stripe API 키 연동 (mock -> real)
5. 실제 AI API (OpenAI/Claude) 연동 (mock -> real)
6. Sentry 통합 (Next.js 16 공식 지원 시)
7. 도메인 연결 + SSL

### 베타 런칭
1. 베타 유저 20명 온보딩
2. 피드백 수집 + 반영
3. 로드 테스트 실행 (scripts/load-test.ts)
4. 모니터링 대시보드 설정

### 향후 개선
1. Full-text search (PostgreSQL tsvector)
2. WebSocket 실시간 (스터디룸 polling -> WS)
3. 추가 Viz 모듈 (OS/네트워크/DB 등)
4. 국제화 (i18n)
5. PWA / 모바일 최적화
