# Performance-Updates Branch Plan

**Branch name:** `performance-updates`
**Target repo:** `https://github.com/JanishkaM/code-splash-web`
**Scope:** All optimizations — performance, SEO, accessibility, functionality, security, cleanup

---

## Setup
1. Add `https://github.com/JanishkaM/code-splash-web` as a remote
2. Create branch `performance-updates` from current `main`

---

## Phase 1 — Cleanup & Bundle Size (low risk)
- **`package.json`**: Remove unused deps (`@ffmpeg-installer/ffmpeg`, `@base-ui/react`), move `shadcn` to `devDependencies`
- **`layout.tsx`**: Remove unused font imports (`Inter`, `Geist`, `Geist_Mono`) — only Poppins is used
- **`globals.css`**: Remove dead CSS classes (`.cinematic-top`, `.cinematic-bottom`, `.blur-new2`, `.rotate-y-180`), fix duplicate `.heavy-glass` rule
- **`next.config.ts`**: Add `poweredByHeader: false`, `compress: true`

## Phase 2 — Image Fix (partners.tsx)
- Replace 5 `<Image unoptimized>` with native `<img loading="lazy">` in `partners.tsx` — same pattern already used in hero, connect, timeline

## Phase 3 — SEO & Meta
- **`layout.tsx`**: Add Open Graph meta (`og:title`, `og:description`, `og:image`, `og:url`), Twitter cards, `keywords`, `themeColor`
- Create **`public/robots.txt`** (allow all, sitemap reference)
- Create **`public/sitemap.xml`** with homepage + register page

## Phase 4 — Security & Links
- **`connect.tsx`**: Add `rel="noopener noreferrer"` to all 5 `target="_blank"` social links
- **`next.config.ts`**: Add `poweredByHeader: false` (removes `X-Powered-By: Next.js`)

## Phase 5 — Error Handling & UX
- Create **`app/not-found.tsx`** — custom 404 page
- Create **`app/error.tsx`** — client error boundary
- Create **`app/global-error.tsx`** — root layout error boundary

## Phase 6 — Functionality Fix
- **`app/register/university/page.tsx`**: Wire `handleSubmit` to actually POST to `/api/register` instead of just `console.log`

## Phase 7 — Dead Code Cleanup
- Delete unused route files: `school-phase-registration/`, `university-phase-registration/`
- Remove commented-out code in `school/page.tsx` (lines 50-452)
- Remove commented-out video code in `page.tsx`

## Phase 8 — README Update
- Update `README.md`: add LFS setup note, deployment env vars, `NEXT_STATIC_EXPORT` / `NEXT_PUBLIC_BASE_PATH` docs

## Phase 9 — Verify & Push
- Run `npm run lint` (must pass clean)
- Run full build with `NEXT_STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/CODE-SPLASH`
- Commit all changes on `performance-updates` branch
- Push to `https://github.com/JanishkaM/code-splash-web`

---

**Estimated items:** ~18 changes across 12 files + 4 new files
**Risk level:** Low — no structural changes, mostly additive (meta tags, error pages) and cleanup (dead code, unused deps)
