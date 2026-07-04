# Code Splash Web

Developer guide for the Code Splash Web workspace.

## Workspace Setup

1. Get access to the repository in GitHub.
2. Fork the repository or clone it directly, depending on your access flow.
3. Open the cloned project in your editor.
4. Install dependencies:

```bash
npm i
```

5. Start the local development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Git LFS

Binary assets (images, WebP frames) are tracked via Git LFS. After cloning, run:

```bash
git lfs install
git lfs pull
```

If you see broken images, LFS pull likely failed. Re-run the commands above.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `WEBHOOK_URL` | No | Google Apps Script webhook URL — server writes to both Supabase and Google Sheets |
| `NEXT_PUBLIC_WEBHOOK_URL` | No | Same webhook URL, exposed to client for university registration on GitHub Pages |

## Build & Deploy

### GitHub Pages (static export)

```bash
NEXT_STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/CODE-SPLASH npm run build
```

The `NEXT_STATIC_EXPORT` flag enables `output: "export"` and sets `basePath` + `assetPrefix` automatically.

### Vercel (production)

Deploy directly — no special env vars needed. The API route (`/api/register`) works on Vercel.

## GitHub Workflow

All developers have contributor access, but every change must be made in a dedicated branch.

Create a new branch before starting any feature or bug fix. Use a clear branch name that describes the work:

```bash
git checkout -b feat/new-feature-name
git checkout -b bugfix/bug-name
```

Use this pattern for branch names:

- `feat/` for new features
- `bugfix/` for bug fixes
- Add a short, descriptive name after the prefix

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, React 19)
- [TailwindCSS for styling](https://tailwindcss.com/)
- [ShadCN](https://ui.shadcn.com)
- [Lucide React](https://lucide.dev/)
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling

## UI Rules

- Use TailwindCSS for all styling.
- Use ShadCN components only for reusable UI building blocks.
- Do not add another component library unless it is explicitly approved.
- Use Lucide React icons when an icon is needed.
- Don't use custom CSS or inline styles unless absolutely necessary. Tailwind should cover all styling needs.
- Follow the existing design patterns and component usage in the codebase for consistency.
- Don't use custom colors unless it's a new design requirement. Stick to the existing color palette defined in ShadCN configuration.

## Installing ShadCN Components

If a ShadCN component is missing, install it from the terminal before using it.

Example:

```bash
npx shadcn@latest add combobox
```

You can replace `combobox` with any other supported ShadCN component name.

## Development Notes

- Keep changes small and branch-based.
- Prefer existing ShadCN components before creating custom UI.
- Run the app with `npm run dev` while developing.
- Install packages with `npm i` when dependencies are added or updated.
- Run `npm run lint` before committing to ensure code quality.
