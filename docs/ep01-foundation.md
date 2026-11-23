# Episode 01 — Foundation (`ep01-foundation`)

**Branch:** `ep01-foundation`  
**Base:** `main` (after initial spec commit)  
**Merge target:** `main`

## Episode goal

Scaffold InterviewAI with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui. Ship a public landing page and shared site chrome. Registration and login are linked but not implemented until Episode 02.

## End-of-episode demo

1. Run `pnpm dev` and open `http://localhost:3000`.
2. Landing page shows product headline, how it works, benefits, and CTAs.
3. Click **Get started** or **Sign up** → navigates to `/register` (placeholder page).
4. Click **Log in** → navigates to `/login` (placeholder page).
5. Layout is responsive on mobile and desktop.

## Prerequisites

- Node.js 20+
- pnpm installed (`npm install -g pnpm`)
- No database or API keys required for this episode.

## Do not build in this episode

- Prisma, PostgreSQL, Auth.js
- Dashboard, interviews, API routes (except what Next.js ships by default)
- Groq, AssemblyAI, or any AI features

---

## Commands (recording order)

Run from the repository root after checking out `ep01-foundation`.

```bash
git checkout main
git checkout -b ep01-foundation
```

If starting from an empty app folder with only `implementation.md`, initialize the app:

If the repository folder name contains capital letters, npm rejects a root install. Scaffold in a lowercase subfolder, then move files to the repo root:

```bash
pnpm create next-app@latest interviewai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes --use-pnpm
# Move generated files into the repository root (keep implementation.md and docs/)
```

Initialize shadcn/ui (Episodes use the default New York style):

```bash
pnpm dlx shadcn@latest init -y -d
```

Add UI primitives used on the landing page:

```bash
pnpm dlx shadcn@latest add button card -y
```

```bash
pnpm dev
```

---

## File creation order

Create or generate files in this order on camera. Skip lines marked **(generated)** if you use the CLI above; still explain their role.

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `package.json` **(generated)** | Project dependencies and scripts (`dev`, `build`, `lint`). |
| 2 | `tsconfig.json` **(generated)** | TypeScript compiler options and `@/*` path alias. |
| 3 | `next.config.ts` **(generated)** | Next.js configuration. |
| 4 | `postcss.config.mjs` **(generated)** | PostCSS pipeline for Tailwind. |
| 5 | `eslint.config.mjs` **(generated)** | ESLint rules for Next.js. |
| 6 | `.gitignore` **(generated)** | Ignore `node_modules`, `.next`, `.env`, etc. |
| 7 | `components.json` **(generated)** | shadcn/ui configuration (paths, style, Tailwind). |
| 8 | `src/app/globals.css` **(generated)** | Global styles, Tailwind layers, CSS variables for theming. |
| 9 | `src/lib/utils.ts` **(generated)** | `cn()` helper for merging Tailwind class names (shadcn). |
| 10 | `src/components/ui/button.tsx` **(shadcn)** | Reusable button component for CTAs. |
| 11 | `src/components/ui/card.tsx` **(shadcn)** | Card layout for feature and step sections. |
| 12 | `src/components/layout/site-header.tsx` | Top navigation: logo, Log in, Sign up links. |
| 13 | `src/components/layout/site-footer.tsx` | Simple footer with copyright and product name. |
| 14 | `src/app/layout.tsx` | Root layout: fonts, metadata, header/footer wrapper, `globals.css`. |
| 15 | `src/app/page.tsx` | Public landing page (hero, how it works, benefits, CTA). |
| 16 | `src/app/(auth)/login/page.tsx` | Placeholder login page (Episode 02 replaces content). |
| 17 | `src/app/(auth)/register/page.tsx` | Placeholder register page (Episode 02 replaces content). |
| 18 | `docs/ep01-foundation.md` | This recording guide (commit with the episode). |

### Optional polish (same episode if time permits)

| File | Purpose |
|------|---------|
| `public/` assets | Favicon or simple SVG logo; not required for MVP demo. |

---

## Landing page content checklist (`src/app/page.tsx`)

- Product name: **InterviewAI**
- One-line value proposition: AI technical interview practice with feedback
- **How it works:** configure → answer (text or voice) → get scores and report
- **Benefits:** role/level-specific questions, adaptive follow-ups, structured feedback
- Primary CTA: link to `/register`
- Secondary CTA: link to `/login`

---

## Pre-merge checklist

- [ ] `pnpm lint` passes (or no new errors)
- [ ] `pnpm build` succeeds
- [ ] Landing and auth placeholders render without console errors
- [ ] All user-visible text is English
- [ ] No secrets in the repository

## Git (end of episode)

```bash
git add .
git commit -m "feat(ep01): scaffold Next.js app with landing and layout"
git checkout main
git merge ep01-foundation
```

If merge conflicts occur, resolve on `main`, then merge `main` back into `ep01-foundation` so both branches match.

Optional tag:

```bash
git tag ep01-foundation
```

## Next episode

From updated `main`, create `ep02-database-auth` and follow `docs/ep02-database-auth.md` (created in Episode 02).