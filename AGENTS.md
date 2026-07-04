<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16.2.9** (App Router, React 19) — not standard Next.js; read `node_modules/next/dist/docs/` before changes
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` plugin, not the legacy `tailwindcss` PostCSS plugin; config in `tailwind.config.ts` still exists but v4 also uses `@theme inline` in `app/globals.css`
- **ShadCN v4** (`radix-sera` style, `stone` base color, CSS variables enabled) — install missing components via `npx shadcn@latest add <component>`
- **Supabase** for CMS database + auth — `@supabase/ssr` for browser/server clients, schema in `supabase/schema.sql`
- **GSAP** (`@gsap/react`) for scroll-driven animations; **Lenis** for smooth scrolling
- **Lucide React** for icons; `class-variance-authority`, `clsx`, `tailwind-merge` for styling utilities
- **Package manager: npm** (lockfile is `package-lock.json`)

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build
npm run lint       # eslint (next core-web-vitals + typescript configs)
```

There are no typecheck, test, or format scripts in `package.json`. CI runs `npx tsc --noEmit` separately (see `.github/workflows/ci.yml`). Before pushing, run lint locally; CI will catch type errors.

## Git LFS

Binary assets (images, WebP frames, fonts) are tracked via Git LFS. After cloning:

```bash
git lfs install
git lfs pull
```

Broken images usually mean LFS pull failed.

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

| Variable | Purpose |
|---|---|
| `WEBHOOK_URL` | Google Apps Script webhook — server dual-writes to Supabase + Google Sheets |
| `NEXT_PUBLIC_WEBHOOK_URL` | Client-side version (needed for GitHub Pages static export) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `JWT_SECRET` | Secret for CMS JWT auth (HS256, 7-day expiry, cookie `cms_session`) |
| `NEXT_STATIC_EXPORT` | Set `true` for GitHub Pages static export |
| `NEXT_PUBLIC_BASE_PATH` | Set `/CODE-SPLASH` for GitHub Pages static export |

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `app/api/` — API routes: `register/` (school + university), `auth/login|logout|me`
- `app/admin/` — CMS admin dashboard (protected by middleware)
- `app/register/` — School and university registration forms
- `components/ui/` — ShadCN components (17 installed)
- `components/sections/` — Homepage section components (hero, chapters, timeline, etc.)
- `components/cms/` — Admin panel components (Spreadsheet, Sidebar, ImageUpload, etc.)
- `lib/auth.ts` — JWT session management (jose library, HS256, cookie-based)
- `lib/store.ts` — Zustand store with `persist` middleware for school registration form
- `lib/validate.ts` — Client-side validators (phone, email, rate limiting)
- `lib/utils.ts` — `cn()` helper, `basePath`, `imageUrl()`
- `lib/supabase/` — Supabase clients (`client.ts` browser, `server.ts` server, `middleware.ts`)
- `supabase/schema.sql` — Full database schema (RLS policies, storage bucket)
- `scripts/` — Google Apps Script webhook + debug/test scripts

## Key Flows

### Registration Submission
1. Browser (`app/register/school/page.tsx`) → POST `/api/register` with URL-encoded form data
2. API route dual-writes to **Supabase** and **Google Sheets webhook** (`WEBHOOK_URL`)
3. University registration follows the same pattern at `app/register/university/`

### Admin CMS
- `app/admin/` — protected by `middleware.ts` (JWT cookie check)
- Unauthenticated → redirect to `/admin/login`
- Authenticated visiting `/admin/login` → redirect to `/admin/dashboard`
- Headers `x-user-role`, `x-user-id`, `x-user-name` injected for downstream use

## Conventions

- **Path alias**: `@/*` maps to project root (e.g., `@/components/ui/button`, `@/lib/utils`)
- **Font**: Poppins is the main body font (`--font-poppins` via `font-main`)
- **Colors**: `bg` (#000000), `white`, `orange` (#ff6b00), `orange-glow`, `glass-bg`, `glass-border` — defined in both `tailwind.config.ts` and `app/globals.css` `@theme inline`
- **Branch naming**: `feat/<name>` or `bugfix/<name>`
- **UI rules**: Tailwind only for styling; no custom CSS or inline styles unless necessary; no extra component libraries without approval
- **Body has `height: 900vh`** set in `globals.css` — intentional for the long-scroll design; do not change without understanding the scroll-driven layout
- **Run `npm run lint` before committing**

## Gotchas

- `globals.css` defines duplicate `.heavy-glass` rules (lines 130-133 and 141-147) — the second overrides the first; be aware when modifying
- Scrollbar is hidden globally via both CSS (`::-webkit-scrollbar { display: none }`) and utility class `.hide-scrollbar`
- The `@theme inline` block in `globals.css` defines ShadCN CSS variable mappings — changing colors here affects both Tailwind and ShadCN components
- Static export (`NEXT_STATIC_EXPORT=true`) disables API routes — university registration falls back to `NEXT_PUBLIC_WEBHOOK_URL` client-side
- Supabase server client (`lib/supabase/server.ts`) uses direct `@supabase/supabase-js`, not the SSR wrapper — be aware if modifying auth flows
