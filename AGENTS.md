<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

CodeSplash 2026 hackathon landing site. Single-page app with scroll-driven canvas animations, a registration form, and a full CMS admin panel.

- **Framework**: Next.js 16 (App Router, standalone output)
- **React 19**, **TailwindCSS v4**, **ShadCN** (radix-sera style, stone base)
- **Path alias**: `@/*` maps to repo root
- **Domain**: https://codesplash.cssa.lk
- **Repo**: https://github.com/cssa-uok/code-splash
- **Authors**: Rithika (lead), Pahan, Yasiru

## Commands

```bash
npm run dev        # dev server at localhost:3000
npm run build      # production build
npm run lint       # eslint (flat config, next core-web-vitals + typescript)
```

## Structure

### Public Pages
- `app/page.tsx` — Main landing page. Heavy client component: canvas frame-sequence animation (1265 frames from `public/assets/frames/`), particle system, scroll-driven section transitions. ~730 lines.
- `app/register/page.tsx` — Registration form entry (renders `RegistrationForm`).
- `app/register/school/page.tsx` — Multi-step school registration form.
- `app/register/university/page.tsx` — Multi-step university registration form.
- `app/layout.tsx` — Root layout. Loads Poppins (Google) and Rebeca (local) fonts. Wraps children in `TooltipProvider`. Contains full SEO metadata (OpenGraph, Twitter card, authors, canonical URL).
- `app/globals.css` — Tailwind v4 imports, ShadCN theme vars, custom glass-panel/animation CSS.

### CMS Admin (`/cms/*`)
- `app/cms/layout.tsx` → `ClientLayout.tsx` — CMS shell with sidebar, GSAPWrapper entry animation, RoleProvider.
- `app/cms/RoleProvider.tsx` — Client auth context. Fetches session from `/cms/api/session` (HttpOnly cookie). Handles `must_change_password` redirect.
- `app/cms/Sidebar.tsx` — Navigation sidebar with role-based filtering, hover-expand to show labels.
- `app/cms/(auth)/login/page.tsx` — Login page (calls `/cms/api/login`).
- `app/cms/(auth)/change-password/page.tsx` — Forced password change page (calls `/cms/api/change-password`).
- `app/cms/dashboard/page.tsx` — Dashboard overview.
- `app/cms/content/{chapters,prizes,timeline,partners,team,faq}/page.tsx` — Server components fetching from Supabase, rendering `EditListClient`.
- `app/cms/settings/{hero,cta,connect}/page.tsx` — Settings pages using `EditSingleRow`.
- `app/cms/settings/users/page.tsx` — User management (admin only). Full CRUD for CMS users.
- `app/cms/registrations/page.tsx` — Registrations overview with tabs (School/University) and spreadsheet view.
- `app/cms/audit/page.tsx` — Audit log viewer (admin only).

### CMS API Routes (`/cms/api/*`)
- `app/cms/api/login/route.ts` — POST: bcrypt verify + JWT + HttpOnly cookie. Rate-limited (5/15min per IP, failed attempts only).
- `app/cms/api/logout/route.ts` — POST: clears session cookie.
- `app/cms/api/session/route.ts` — GET: returns current user from cookie.
- `app/cms/api/change-password/route.ts` — POST: changes password, updates cookie. Uses admin client (service role) to bypass RLS.
- `app/cms/api/users/route.ts` — GET/POST: user management (admin only).
- `app/cms/api/users/[id]/route.ts` — PUT/DELETE: user management (admin only). Prevents self-deletion.
- `app/api/register/route.ts` — POST: public registration endpoint (school + university). Rate-limited, input-validated.

### CMS Components (`components/cms/`)
- `EditList.tsx` — Generic editable table (delete-all + reinsert). Supports `text`, `textarea`, `url`, `toggle`, `image` field types.
- `EditSingleRow.tsx` — Single-row editor for settings tables.
- `ImageUpload.tsx` — File picker + aspect ratio crop dialog + WebP conversion + Supabase Storage upload.
- `Spreadsheet.tsx` — CSV preview/export + Excel (.xlsx) export via `xlsx` library. Optional CSV import. Used only on the Registrations page.
- `GSAPWrapper.tsx` — Fade-in + slide-up animation wrapper (used in CMS layout).
- `PageHeader.tsx` — Reusable page header with breadcrumbs.
- `SidebarContext.tsx` — Sidebar open/close/hover state.

### Auth & Security
- `lib/auth-shared.ts` — JWT create/verify, bcrypt hash/verify. **Requires `JWT_SECRET` env var in production (throws on startup).**
- `lib/auth.ts` — Server-side cookie session management (HttpOnly, SameSite=strict, Secure in prod).
- `lib/auth-guard.ts` — Server-side `requireRole()` helper for route protection in server components.
- `lib/csrf.ts` — Origin/Referer validation (allows localhost in dev mode).
- `proxy.ts` — Next.js 16 middleware replacement. Handles /admin→/cms redirect, JWT verification, unauthenticated redirects, RBAC route enforcement. **Throws on missing `JWT_SECRET` in production.**

### Data Layer
- `lib/supabase/server.ts` — Server Supabase client (anon key, RLS handles access).
- `lib/supabase/client.ts` — Browser Supabase client (singleton).
- `lib/supabase/queries.ts` — Typed fetch functions for all CMS entities. Passes through full HTTP URLs.
- `lib/useCMSData.ts` — Client hook: fetches all 9 CMS tables on mount for the public site.

### Security Features
- 9 security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, X-Permitted-Cross-Domain-Policies, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy) in `next.config.ts`.
- Rate limiting on login (5 attempts/15min per IP, in-memory, failed attempts only — successful logins clear the counter).
- Rate limiting on registration (5 per 15min per IP).
- CSRF protection via Origin/Referer validation on all CMS API POST/PUT/DELETE routes.
- JWT token never returned in response body (HttpOnly cookie only).
- Timing attack prevention (dummy bcrypt hash on unknown users).
- Audit logging for login success/failure (to `audit_log` table).
- `poweredByHeader: false` in Next.js config.
- RBAC enforced at both proxy level (HTTP redirects) and server component level (`requireRole()`).

### Tests
- `tests/01-auth-bypass.js` — Authentication bypass testing
- `tests/02-sql-injection.js` — SQL injection testing
- `tests/03-jwt-tampering.js` — JWT token tampering
- `tests/04-rate-limiting.js` — Rate limiting verification
- `tests/05-credential-exposure.js` — Credential exposure testing
- `tests/06-security-headers.js` — Security header verification
- `tests/07-rbac.js` — RBAC enforcement (proxy.ts checks)
- `tests/08-session-management.js` — Session management (cookie parsing)
- `tests/09-cms-crud.js` — CMS CRUD propagation (insert/verify/cleanup)
- `tests/10-rbac.js` — Full RBAC integration (29 tests: viewer/editor/admin/forged JWT)
- `tests/11-jwt-secret-enforcement.js` — JWT_SECRET enforcement in production
- `tests/12-csrf-protection.js` — CSRF Origin/Referer validation
- `tests/13-password-strength.js` — Password complexity requirements
- `tests/14-registration-rate-limit.js` — Registration rate limiting
- `tests/15-input-validation.js` — Registration input validation
- `tests/16-role-enforcement.js` — Server-side role enforcement
- `tests/17-plaintext-password.js` — Plaintext password rejection
- `tests/18-csp-and-headers.js` — CSP and security headers
- `tests/19-role-validation.js` — Role whitelist validation
- `tests/helpers.js` — Test utilities (login, JWT creation, request helpers with CSRF headers)
- `tests/config.js` — Test configuration (loads from `.env.local` via dotenv)
- `tests/run-all.js` — Test runner. Usage: `node tests/run-all.js` or `node tests/run-all.js 09`

### Scripts
- `scripts/seed-users.js` — Seeds admin/test/viewer accounts via service role key
- `scripts/test_school_register.js` — School registration API test
- `scripts/test_university_register.js` — University registration API test
- `scripts/CodeSplash_AppsScript.gs` — Google Apps Script (external)

### Other
- `components/ui/` — ShadCN components. Install missing ones with `npx shadcn@latest add <name>`.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `public/assets/frames/` — 1265 `.webp` frames for scroll animation. Do not rename or renumber.
- `public/sw.js` — Service worker for frame caching (registered via `components/sw-registrar.tsx`).
- `public/preloader.worker.js` — Web Worker for parallel frame loading.
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
- All CMS API routes under `/cms/api/*` are exempt from proxy auth checks (handled by the route itself or the client).
- Next.js 16 uses `proxy.ts` (not `middleware.ts`). Creating both crashes the server.
- `redirect()` from `next/navigation` in RSC does NOT produce HTTP 307 for raw `fetch()` requests; actual HTTP-level redirects require proxy-level checks.
- Images from Supabase storage must use `unoptimized` on Next.js `<Image>` to avoid 400 errors.
- `getStorageUrl` and `imageUrl` in utils pass through full HTTP URLs unchanged.
