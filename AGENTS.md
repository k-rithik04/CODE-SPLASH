<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16.2.9** (App Router, React 19) — not standard Next.js; read `node_modules/next/dist/docs/` before changes
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` plugin, not the legacy `tailwindcss` PostCSS plugin; config in `tailwind.config.ts` still exists but v4 also uses `@theme inline` in `app/globals.css`
- **ShadCN v4** (`radix-sera` style, `stone` base color, CSS variables enabled) — install missing components via `npx shadcn@latest add <component>`
- **Lucide React** for icons; `class-variance-authority`, `clsx`, `tailwind-merge` for styling utilities
- **Package manager: npm** (lockfile is `package-lock.json`)

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build
npm run lint       # eslint (next core-web-vitals + typescript configs)
```

There are no typecheck, test, or format scripts defined. Lint is the only verification command.

## Project structure

- `app/` — Next.js App Router pages (`layout.tsx`, `page.tsx`, `app/register/page.tsx`)
- `app/api/register/route.ts` — School registration API route (proxies to Apps Script webhook or Google Forms fallback)
- `components/ui/` — ShadCN components (button, card, input, dialog, select, tooltip, etc.)
- `lib/utils.ts` — exports `cn()` (clsx + tailwind-merge)
- `lib/store.ts` — Zustand store with `persist` middleware for school registration form state
- `lib/validator.ts` — Validation functions for school form (`validateRequired`, `validateSriLankanPhone`, `checkRateLimit`, `recordSubmissionTimestamp`)
- `scripts/CodeSplash_AppsScript.gs` — Google Apps Script webhook for direct sheet writes
- `app/globals.css` — Tailwind v4 imports (`@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`), `@theme inline` block, and custom utility classes (`.glass-panel`, `.clean-glass`, `.heavy-glass`, `.interactive-btn`, `.jump-btn`, etc.)

## Conventions

- **Path alias**: `@/*` maps to project root (e.g., `@/components/ui/button`, `@/lib/utils`)
- **Font**: Poppins is the main body font (`--font-poppins` via `font-main`). Inter, Geist, Geist Mono are also loaded but Poppins is the primary.
- **Colors**: `bg` (#000000), `white`, `orange` (#ff6b00), `orange-glow`, `glass-bg`, `glass-border` — defined in both `tailwind.config.ts` and `app/globals.css` `@theme inline`
- **Branch naming**: `feat/<name>` or `bugfix/<name>`
- **UI rules**: Tailwind only for styling; no custom CSS or inline styles unless necessary; no extra component libraries without approval
- **Body has `height: 900vh`** set in `globals.css` — this is intentional for the long-scroll design; do not change without understanding the scroll-driven layout

## School Registration Submission Flow

1. **Browser** (`app/register/school/page.tsx`) → POST `/api/register` with URL-encoded form data
2. **API Route** (`app/api/register/route.ts`) → proxies to:
   - **Primary**: Google Apps Script webhook (`WEBHOOK_URL` env var) — writes directly to the sheet
   - **Fallback**: Google Forms `formResponse` endpoint with `entry.*` IDs
3. Configure by setting `WEBHOOK_URL=your-script-url` in `.env.local`

The Apps Script (`scripts/CodeSplash_AppsScript.gs`) must be deployed from the sheet (Extensions > Apps Script) as a web app with "Anyone" access.

## Gotchas

- `globals.css` defines duplicate `.heavy-glass` rules (lines 130-133 and 141-147) — the second overrides the first; be aware when modifying
- Scrollbar is hidden globally via both CSS (`::-webkit-scrollbar { display: none }`) and utility class `.hide-scrollbar`
- The `@theme inline` block in `globals.css` defines ShadCN CSS variable mappings — changing colors here affects both Tailwind and ShadCN components
- No `.env` files exist; no environment variables are currently used
