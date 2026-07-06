<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

CodeSplash 2026 hackathon landing site. Single-page app with scroll-driven canvas animations, a registration form, and a full CMS admin panel.

- **Framework**: Next.js 16 (App Router, standalone output)
- **React 19**, **TailwindCSS v4**, **ShadCN** (radix-sera style, stone base)
- **Path alias**: `@/*` maps to repo root

## Commands

```bash
npm run dev        # dev server at localhost:3000
npm run build      # production build
npm run lint       # eslint (flat config, next core-web-vitals + typescript)
```

## Structure

### Public Pages
- `app/page.tsx` — Main landing page. Heavy client component: canvas frame-sequence animation (1265 frames from `public/frames/`), particle system, scroll-driven section transitions. ~900 lines.
- `app/register/page.tsx` — Registration form entry (renders `RegistrationForm`).
- `app/register/school/page.tsx` — Multi-step school registration form.
- `app/register/university/page.tsx` — Multi-step university registration form.
- `app/layout.tsx` — Root layout. Loads Inter, Geist, Poppins fonts (Google) and Rebeca (local). Wraps children in `TooltipProvider`.
- `app/globals.css` — Tailwind v4 imports, ShadCN theme vars, custom glass-panel/animation CSS.

### CMS Admin (`/cms/*`)
- `app/cms/layout.tsx` → `ClientLayout.tsx` — CMS shell with sidebar, GSAPWrapper entry animation, RoleProvider.
- `app/cms/RoleProvider.tsx` — Client auth context. Fetches session from `/cms/api/session` (HttpOnly cookie).
- `app/cms/Sidebar.tsx` — Navigation sidebar with all CMS route links.
- `app/cms/(auth)/login/page.tsx` — Login page (calls `/cms/api/login`).
- `app/cms/(auth)/change-password/page.tsx` — Forced password change page (calls `/cms/api/change-password`).
- `app/cms/dashboard/page.tsx` — Dashboard overview.
- `app/cms/content/{chapters,prizes,timeline,partners,team,faq}/page.tsx` — Server components fetching from Supabase, rendering `EditListClient`.
- `app/cms/settings/{hero,cta,connect}/page.tsx` — Settings pages using `EditSingleRow`.
- `app/cms/registrations/page.tsx` — Registrations overview with tabs (School/University) and spreadsheet view.
- `app/cms/audit/page.tsx` — Audit log viewer.

### CMS API Routes (`/cms/api/*`)
- `app/cms/api/login/route.ts` — POST: bcrypt verify + JWT + HttpOnly cookie. Rate-limited (5/15min per IP).
- `app/cms/api/logout/route.ts` — POST: clears session cookie.
- `app/cms/api/session/route.ts` — GET: returns current user from cookie.
- `app/cms/api/change-password/route.ts` — POST: changes password, updates cookie.
- `app/api/register/route.ts` — POST: public registration endpoint (school + university).

### CMS Components (`components/cms/`)
- `EditList.tsx` — Generic editable table (delete-all + reinsert). Supports `text`, `textarea`, `url`, `toggle`, `image` field types. Includes Spreadsheet toolbar.
- `EditSingleRow.tsx` — Single-row editor for settings tables.
- `ImageUpload.tsx` — File picker + aspect ratio crop dialog + WebP conversion + Supabase Storage upload.
- `Spreadsheet.tsx` — CSV preview/export + Excel (.xlsx) export via `xlsx` library. Optional CSV import.
- `GSAPWrapper.tsx` — Fade-in + slide-up animation wrapper (used in CMS layout).
- `PageHeader.tsx` — Reusable page header with breadcrumbs.
- `SidebarContext.tsx` — Sidebar open/close state.

### Auth & Security
- `lib/auth-shared.ts` — JWT create/verify, bcrypt hash/verify. **Requires `JWT_SECRET` env var in production.**
- `lib/auth.ts` — Server-side cookie session management (HttpOnly, SameSite=strict, Secure in prod).
- `lib/auth-client.ts` — **Deprecated**: previously used for localStorage sessions, now unused.
- `middleware.ts` — Route protection: skips `/cms/api`, redirects unauthenticated `/cms/*` to login, `/admin/*` redirects to `/cms/*`.

### Data Layer
- `lib/supabase/server.ts` — Server Supabase client (anon key, RLS handles access).
- `lib/supabase/client.ts` — Browser Supabase client (singleton).
- `lib/supabase/queries.ts` — Typed fetch functions for all CMS entities.
- `lib/useCMSData.ts` — Client hook: fetches all 9 CMS tables on mount for the public site.

### Security Features
- 6 security headers (CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy) in `next.config.ts`.
- Rate limiting on login (5 attempts/15min per IP, in-memory).
- JWT token never returned in response body (HttpOnly cookie only).
- Timing attack prevention (dummy bcrypt hash on unknown users).
- Audit logging for login success/failure (to `audit_log` table).
- `poweredByHeader: false` in Next.js config.

### Tests
- `tests/01-08` — Security tests (auth bypass, SQL injection, JWT tampering, rate limiting, credential exposure, security headers, RBAC, session management).
- `tests/09-cms-crud.js` — CMS CRUD propagation test (insert/verify/cleanup for all 6 content tables + 3 settings tables).
- `tests/helpers.js` — Test utilities (login, Supabase queries, JWT forging).
- `tests/config.js` — Test configuration (base URL, Supabase keys).
- `tests/run-all.js` — Test runner. Usage: `node tests/run-all.js` or `node tests/run-all.js 09`.

### Scripts
- `scripts/test_school_register.js` — School registration API test.
- `scripts/test_university_register.js` — University registration API test.
- `scripts/CodeSplash_AppsScript.gs` — Google Apps Script (external).

### Other
- `components/ui/` — ShadCN components. Install missing ones with `npx shadcn@latest add <name>`.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `public/frames/` — 1265 `.webp` frames for scroll animation. Do not rename or renumber.
- `supabase/schema.sql` — DB schema. Default admin user on line 555-556.

## Conventions

- All styling via Tailwind utilities. No inline styles or custom CSS unless unavoidable.
- Use existing ShadCN components before building custom UI.
- Lucide React for icons.
- `use client` required for any component using browser APIs, hooks, or event handlers.
- Scroll-driven sections in `app/page.tsx` are controlled by a single `requestAnimationFrame` loop keyed to `window.scrollY`. Section timing is defined in the `t` object (~line 249). Adjust timing values there, not in individual sections.
- CMS content tables use the `EditList` component with a delete-all + reinsert save strategy.
- CMS settings tables use `EditSingleRow` for single-row editing.
- Auth uses JWT in HttpOnly cookies (not Supabase Auth). Passwords stored as bcrypt hashes in `profiles` table.
- All CMS API routes under `/cms/api/*` are exempt from middleware auth checks (handled by the route itself or the client).
