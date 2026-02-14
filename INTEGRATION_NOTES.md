# Integration Notes - ui-v0 to cs-viz-app

This document records every integration patch applied when copying ui-v0 components into the production app.

## Principle

- ui-v0/ directory is READ-ONLY (never modified)
- Components copied to src/ and adapted
- Design tokens (CSS variables, Tailwind config) preserved exactly
- Import paths adjusted for src/ directory structure

## Patches Applied

### 1. Directory Structure
- **ui-v0/app/** -> **src/app/**: All pages copied, `@/` imports still resolve via tsconfig paths
- **ui-v0/components/** -> **src/components/**: All components copied as-is
- **ui-v0/lib/** -> **src/lib/**: utils.ts and data.ts copied
- **ui-v0/hooks/** -> **src/hooks/**: use-mobile.tsx and use-toast.ts copied
- **ui-v0/styles/** -> **src/styles/**: globals.css copied (unused, app/globals.css is primary)

### 2. tsconfig.json
- **Change**: `"@/*": ["./*"]` -> `"@/*": ["./src/*"]`
- **Reason**: src/ directory structure requires path remapping
- **Impact**: All `@/` imports resolve to src/

### 3. tailwind.config.ts
- **Change**: Content paths from `'./pages/**/*', './components/**/*', './app/**/*'` -> `'./src/**/*'`
- **Reason**: Components moved to src/
- **Impact**: None - same Tailwind classes generated

### 4. layout.tsx (src/app/layout.tsx)
- **Change**: Added `<Providers>` wrapper around `{children}`
- **Change**: Added `suppressHydrationWarning` to `<html>` tag
- **Reason**: NextAuth SessionProvider + ThemeProvider + Toaster needed at root
- **Impact**: All pages have auth context and theme support

### 5. nav-header.tsx (src/components/nav-header.tsx)
- **Change**: Login/logout buttons wired to NextAuth `signIn()`/`signOut()`
- **Change**: Added user avatar dropdown when authenticated
- **Change**: Uses `useSession()` from next-auth/react
- **Reason**: Replace static buttons with real auth actions
- **Impact**: Header reflects auth state

### 6. session-player-shell.tsx (src/components/session/session-player-shell.tsx)
- **Change**: Added 30-minute countdown timer with stage-based structure
- **Change**: Added API calls for session creation, checkpoint save/restore
- **Change**: Added share card creation flow
- **Reason**: Replace static mock with functional session player
- **Impact**: Full session lifecycle supported

### 7. viz-canvas.tsx (src/components/session/viz-canvas.tsx)
- **Change**: Replaced placeholder with VizEngine component
- **Change**: Takes moduleId and vizHandle props
- **Reason**: Connect to actual visualization engine
- **Impact**: 3 interactive visualizations render here

### 8. viz-controls.tsx (src/components/session/viz-controls.tsx)
- **Change**: Wired to VizEngine state (play/pause/speed/step/reset/failure mode)
- **Change**: Added progress slider and failure mode toggle
- **Reason**: Controls need to drive visualization state
- **Impact**: Full control over viz playback

### 9. quiz-card.tsx (src/components/session/quiz-card.tsx)
- **Change**: API-driven question fetching and answer submission
- **Change**: Multi-question navigation, scoring, explanations
- **Change**: "Viz로 돌아가기" button on incorrect answers
- **Reason**: Replace static quiz with functional version
- **Impact**: Real quiz experience with grading

### 10. apply-task-card.tsx (src/components/session/apply-task-card.tsx)
- **Change**: API-driven task fetching, submission, auto-grading
- **Change**: Added hints display and result feedback
- **Reason**: Replace static card with functional task
- **Impact**: Real apply task experience

### 11. reflection-composer.tsx (src/components/session/reflection-composer.tsx)
- **Change**: 3-sentence validation, character counter, public/private toggle
- **Change**: API submission, success toast
- **Reason**: Replace static form with functional version
- **Impact**: Reflections saved to DB

### 12. community-feed.tsx (src/components/community/community-feed.tsx)
- **Change**: API-driven feed (GET /api/community), pagination, sort
- **Reason**: Replace static mock posts with real data
- **Impact**: Dynamic community content

### 13. feed-post.tsx (src/components/community/feed-post.tsx)
- **Change**: Like toggle (optimistic UI), share link copy, report dropdown
- **Reason**: Wire interactions to API
- **Impact**: Real social interactions

### 14. comment-thread.tsx (src/components/community/comment-thread.tsx)
- **Change**: CRUD via API, auth-gated, input sanitization
- **Reason**: Replace static comments with real data
- **Impact**: Real comment system

### 15. share-card.tsx (src/components/share-card.tsx)
- **Change**: Dynamic data from API, copy link, public/private toggle
- **Reason**: Wire to real share system
- **Impact**: Shareable session results

### 16. share/[id]/page.tsx (src/app/share/[id]/page.tsx)
- **Change**: Server component with generateMetadata for OG tags
- **Change**: Fetches from DB instead of static data
- **Reason**: Real share pages with social preview
- **Impact**: OG cards work for social sharing

## Design Tokens Preserved

All CSS custom properties from ui-v0/app/globals.css copied exactly:
- Primary: hsl(142, 71%, 45%) (green)
- Dark theme defaults
- Chart colors (5 variants)
- Sidebar tokens
- Border radius (--radius: 0.625rem)
- Success/Warning/Info semantic colors

## Components NOT Modified (copied as-is)

- All 35+ shadcn/ui primitives in components/ui/
- theme-provider.tsx
- landing-hero.tsx, landing-footer.tsx, how-it-works.tsx
- featured-modules.tsx, module-card.tsx, modules-library.tsx
- profile-view.tsx
- stage-tabs.tsx (minimal changes for completedStages prop)

## New Components (not from ui-v0)

- src/components/viz/ (viz-engine, http-journey, concurrency-viz, git-areas-viz)
- src/components/providers.tsx
- src/components/admin/report-list.tsx
- src/app/(auth)/login/page.tsx
- src/app/admin/page.tsx
- src/app/api/ (all API routes)
- src/lib/auth.ts, db.ts, rate-limit.ts, validations.ts, sanitize.ts
