# CodeSplash 2026

**Sri Lanka's premier national-level university & school hackathon**
Live: [https://codesplash.cssa.lk](https://codesplash.cssa.lk)

---

## Portfolio Attribution

| Role | Name |
|------|------|
| Lead Developer | **Rithika** ([@k-rithik04](https://github.com/k-rithik04)) |
| Developer | **Pahan** |
| Developer | **Yasiru** |

Built as a full-stack portfolio project demonstrating end-to-end product engineering: scroll-driven canvas animations, a complete CMS admin panel with RBAC, public registration flows, security hardening, and production deployment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| UI | React 19, TailwindCSS v4, ShadCN (radix-sera, stone base) |
| Animation | GSAP 3, Lenis smooth scroll, canvas frame-sequence (1265 `.webp` frames) |
| Auth | JWT (jose) in HttpOnly cookies, bcrypt password hashing, RBAC (admin/editor/viewer) |
| Database | Supabase (PostgreSQL + RLS, Supabase Storage for images) |
| Security | CSP headers, CSRF validation, rate limiting, audit logging |
| Deployment | Vercel (primary), GitHub Pages (fallback) |
| Testing | Custom Node.js test runner (19 security + integration test suites) |

---

## Features

### Public Site
- **Scroll-driven canvas animation** — 1265-frame preloaded WebP sequence with a Web Worker for parallel loading and a Service Worker for offline caching
- **Section transitions** — Hero, Prizes, Timeline, Partners, Team, FAQ, CTA, Connect — all driven by a single `requestAnimationFrame` loop
- **Registration** — Multi-step forms for both school (3-5 members) and university (individual + team) tracks
- **Responsive design** — Glassmorphism panels, Tailwind utilities throughout

### CMS Admin (`/cms`)
- **RBAC** — Three roles: admin (full access), editor (content + settings), viewer (dashboard + registrations only)
- **Content management** — Editable tables for chapters, prizes, timeline, partners, team, FAQ
- **Settings** — Hero, CTA, connect section configuration
- **Registrations** — Spreadsheet view with CSV/Excel export
- **User management** — Create, edit, delete CMS users (admin only)
- **Audit log** — Login success/failure tracking (admin only)

### Security
- JWT tokens never returned in response body (HttpOnly cookie only)
- CSRF protection via Origin/Referer validation on all CMS API routes
- Rate limiting on login (5 attempts/15 min per IP) and registration endpoints
- Timing attack prevention (dummy bcrypt hash on unknown users)
- 9 security headers (CSP, HSTS, X-Frame-Options, etc.) via `next.config.ts`
- Server-side RBAC enforced in `proxy.ts` (Next.js 16 middleware replacement)
- Full security audit documented in `SECURITY-AUDIT.md`

---

## Architecture

```
app/
  page.tsx              # Landing page (canvas animation, sections)
  layout.tsx            # Root layout (fonts, SEO metadata)
  register/
    page.tsx            # Registration entry
    school/page.tsx     # Multi-step school form
    university/page.tsx # Multi-step university form
  cms/
    layout.tsx          # CMS shell (sidebar, auth)
    ClientLayout.tsx    # Route guards, role-based layout
    dashboard/          # Dashboard overview
    content/            # chapters, prizes, timeline, partners, team, faq
    settings/           # hero, cta, connect, users
    registrations/      # Spreadsheet view
    audit/              # Audit log
    api/                # login, logout, session, change-password, users
  api/register/route.ts # Public registration endpoint

proxy.ts               # Middleware: RBAC, CSRF, redirects
lib/
  auth-shared.ts       # JWT + bcrypt utilities
  auth.ts              # Cookie session management
  auth-guard.ts        # Server-side requireRole() helper
  csrf.ts              # Origin/Referer validation
  supabase/            # Supabase client + queries
  useCMSData.ts        # Client hook for CMS data
components/
  cms/                 # EditList, EditSingleRow, Spreadsheet, ImageUpload, etc.
  sections/            # Hero, Prizes, Timeline, Partners, Team, FAQ, CTA, Connect
  ui/                  # ShadCN components
tests/                 # 19 security + integration test suites
scripts/               # Seed users, registration API tests
supabase/schema.sql    # Database schema
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase keys, JWT_SECRET, webhook URL

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

### CMS Access

- **URL**: [https://codesplash.cssa.lk/cms/login](https://codesplash.cssa.lk/cms/login)
- **Default admin**: `admin` / `admin123`
- Seed test users: `node scripts/seed-users.js`

---

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint (flat config, next core-web-vitals + typescript)
node tests/run-all.js       # Run all test suites
node tests/run-all.js 09    # Run a specific test
```

---

## Deployment

### Vercel (Primary)
- Auto-deploys from `main` branch
- Region: `sin1` (Singapore)
- Standalone output mode

### GitHub Pages (Fallback)
- Static export via `NEXT_PUBLIC_STATIC_EXPORT=true`
- Build: `npm run build:ghpages`

---

## Security

A comprehensive security audit was performed — see [`SECURITY-AUDIT.md`](./SECURITY-AUDIT.md) for the full report. 12 vulnerabilities were identified and fixed, covering authentication bypass, CSRF, rate limiting, input validation, and more.

---

## License

Private repository. Built for CodeSplash 2026 hackathon by CSSA, University of Kelaniya.
