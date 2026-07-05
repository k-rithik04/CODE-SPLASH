<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

CodeSplash 2026 hackathon landing site. Single-page app with scroll-driven canvas animations and a registration form.

- **Framework**: Next.js 16 (App Router, standalone output)
- **React 19**, **TailwindCSS v4**, **ShadCN** (radix-sera style, stone base)
- **Path alias**: `@/*` maps to repo root

## Commands

```bash
npm run dev        # dev server at localhost:3000
npm run build      # production build
npm run lint       # eslint (flat config, next core-web-vitals + typescript)
```

No test suite or typecheck script exists. Lint is the only verification step.

## Structure

- `app/page.tsx` — Main landing page. Heavy client component: canvas frame-sequence animation (1265 frames from `public/frames/`), particle system, scroll-driven section transitions. ~900 lines.
- `app/register/page.tsx` — Multi-step registration form (team info, leader info, members).
- `app/layout.tsx` — Root layout. Loads Inter, Geist, Poppins fonts (Google) and Rebeca (local). Wraps children in `TooltipProvider`.
- `app/globals.css` — Tailwind v4 imports, ShadCN theme vars, custom glass-panel/animation CSS.
- `components/ui/` — ShadCN components. Install missing ones with `npx shadcn@latest add <name>`.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `public/frames/` — 1265 `.webp` frames for scroll animation. Do not rename or renumber.

## Conventions

- All styling via Tailwind utilities. No inline styles or custom CSS unless unavoidable.
- Use existing ShadCN components before building custom UI.
- Lucide React for icons.
- `use client` required for any component using browser APIs, hooks, or event handlers.
- Scroll-driven sections in `app/page.tsx` are controlled by a single `requestAnimationFrame` loop keyed to `window.scrollY`. Section timing is defined in the `t` object (~line 249). Adjust timing values there, not in individual sections.
