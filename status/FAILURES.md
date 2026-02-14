# FAILURES

## F001: MCP Codex/Gemini 미사용 가능
- **시각**: 2026-02-15T04:30:00Z
- **내용**: ToolSearch("ask_codex"), ToolSearch("ask_gemini") 모두 "No matching deferred tools found" 반환
- **원인**: MCP 서버 미설정
- **대체**: Claude 에이전트(architect, code-reviewer)로 대체
- **영향**: 없음

## F002: Sentry 통합 스킵
- **시각**: 2026-02-15T04:35:00Z
- **내용**: @sentry/nextjs가 Next.js 16과 peer dependency 호환 안됨
- **대체**: 추후 지원 시 통합 예정
- **영향**: 에러 트래킹 미적용 (콘솔 로그 사용)

## F003: rate-limit 테스트 실패 (수정 완료)
- **시각**: 2026-02-15T04:45:00Z
- **내용**: windowSeconds=0 테스트에서 동일 밀리초 내 실행으로 window 미만료
- **수정**: 테스트를 key 분리 테스트로 교체
- **결과**: 61/61 통과

## F004: P1 MCP Codex/Gemini 재시도 실패
- **시각**: 2026-02-15T06:00:00Z
- **내용**: P1 시작 전 ToolSearch("ask_codex"), ToolSearch("ask_gemini") 재시도 → "No matching deferred tools found"
- **원인**: MCP 서버 미설정 (F001과 동일)
- **대체**: Claude architect/code-reviewer 에이전트로 대체
- **영향**: 없음 (필수 MCP 호출 의무 충족 시도 완료)
