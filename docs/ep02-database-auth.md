# Episode 02 — Database & Auth (`ep02-database-auth`)

**Branch:** `ep02-database-auth`  
**Base:** `main` (includes Episode 01)  
**Merge target:** `main`

## Episode goal

Add PostgreSQL with Prisma (full schema for later episodes), Auth.js authentication (Google OAuth + email/password), and a protected dashboard shell.

**Database provider:** [Supabase](https://supabase.com) (managed PostgreSQL). No local Docker database.

## End-of-episode demo

1. Create a Supabase project and copy connection strings into `.env`.
2. Set `AUTH_SECRET` in `.env`.
3. Run `pnpm db:migrate` and `pnpm dev`.
4. Register with **Continue with Google** or email/password → `/dashboard`.
5. Sign out → sign in again with either method.
6. Visit `/dashboard` while logged out → redirect to `/login`.

## Prerequisites

- Episode 01 merged on `main`.
- Free [Supabase](https://supabase.com) account and project.
- **`AUTH_SECRET`** — random string for Auth.js (do not reuse database passwords). Generate on macOS/Linux:

  ```bash
  openssl rand -base64 32
  ```

  Paste the output into `.env` as `AUTH_SECRET="..."` (use the same value locally and on Vercel when you deploy).

## Supabase setup (before recording)

1. Create a new project in the Supabase dashboard.
2. Open **Project Settings → Database**.
3. Under **Connection string**, choose **URI**:
   - **Transaction pooler** (`port 6543`) → paste into `DATABASE_URL` in `.env` (enable `pgbouncer` / use the pooled URI Supabase provides).
   - **Session mode** or **Direct** (`port 5432`) → paste into `DIRECT_URL` (required for `prisma migrate`).
4. Copy `.env.example` to `.env` and fill in both URLs and `AUTH_SECRET`.
5. Run migrations (see below). Supabase SQL Editor is optional for debugging; Prisma owns the schema.

## Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → **OAuth 2.0 Client ID** (Web application).
2. **Authorized JavaScript origins:** `http://localhost:3000` (add production URL when deploying).
3. **Authorized redirect URIs:**
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://YOUR_DOMAIN/api/auth/callback/google`
4. Copy **Client ID** and **Client secret** into `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Google users are stored in the same `User` table; `passwordHash` is null for OAuth-only accounts.

## Do not build in this episode

- Interview configuration, sessions API, Groq, voice, reports UI (beyond empty dashboard copy).
- Docker or self-hosted Postgres.

---

## Commands (recording order)

```bash
git checkout main
git checkout -b ep02-database-auth
```

Install dependencies:

```bash
pnpm add prisma@6 @prisma/client@6 next-auth@beta bcryptjs zod react-hook-form @hookform/resolvers
pnpm dlx shadcn@latest add input label field -y
```

Environment and database:

```bash
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, GOOGLE_* from Supabase and Google Cloud
openssl rand -base64 32   # copy output into AUTH_SECRET in .env
pnpm db:migrate
pnpm db:generate
pnpm dev
```

---

## File creation order

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `.env.example` | Supabase `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` template. |
| 2 | `prisma/schema.prisma` | Full data model; `directUrl` for Supabase migrations. |
| 3 | `package.json` | Add `db:migrate`, `db:generate`, `db:studio` scripts. |
| 4 | `src/lib/prisma.ts` | Singleton Prisma client for server code. |
| 5 | `src/lib/validations/auth.ts` | Zod schemas for register and login. |
| 6 | `src/types/next-auth.d.ts` | Extend session with `user.id`. |
| 7 | `src/auth.ts` | Auth.js config, credentials provider, JWT session. |
| 8 | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handlers. |
| 9 | `src/app/api/auth/register/route.ts` | Create user with hashed password. |
| 10 | `src/features/authentication/actions.ts` | Server action for sign out. |
| 11 | `src/middleware.ts` | Protect `/dashboard` and future private routes. |
| 12 | `src/components/auth/login-form.tsx` | Client login form (React Hook Form + Zod). |
| 13 | `src/components/auth/register-form.tsx` | Client register form; calls register API then signs in. |
| 14 | `src/app/(auth)/login/page.tsx` | Login page; redirect if already authenticated. |
| 15 | `src/app/(auth)/register/page.tsx` | Register page; redirect if already authenticated. |
| 16 | `src/app/(dashboard)/dashboard/page.tsx` | Protected welcome dashboard (Episode 03 adds interview actions). |
| 17 | `src/components/layout/site-header.tsx` | Async header; show dashboard + sign out when session exists. |
| 18 | `src/components/layout/site-header-fallback.tsx` | Static header for Suspense fallback (prerender-friendly). |
| 19 | `src/components/layout/site-header-actions.tsx` | Dashboard link and sign-out form. |
| 20 | `prisma/migrations/` | Initial migration SQL (`pnpm db:migrate` against Supabase via `DIRECT_URL`). |
| 21 | `src/lib/auth/ensure-oauth-user.ts` | Upsert `User` row when signing in with Google. |
| 22 | `src/components/auth/google-sign-in-button.tsx` | Continue with Google button. |
| 23 | `src/components/auth/auth-divider.tsx` | Visual divider between OAuth and email form. |
| 24 | `docs/ep02-database-auth.md` | This guide. |

After creating `schema.prisma`, run:

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

---

## Prisma schema notes

- `directUrl` uses `DIRECT_URL` so migrations run against Supabase session/direct port, not the transaction pooler.
- Store `InterviewSession.status` as strings: `pending`, `in_progress`, `completed`, `abandoned`.
- Store `InterviewQuestion.questionType` as `opening` or `follow_up`.
- JSON columns: `InterviewAnswer.evaluation`, report `strengths`, `weaknesses`, `recommendations`.
- All interview relations cascade delete from `User` where appropriate.
- Use only the `User` table from this episode in Supabase; other tables are ready for later episodes.

---

## Pre-merge checklist

- [ ] Migrations apply on a fresh Supabase database.
- [ ] Register, login, logout, and dashboard protection work.
- [ ] No secrets committed; `.env` is gitignored.
- [ ] `pnpm build` succeeds with valid `.env`.
- [ ] All UI copy and comments are English.

## Git (you run these)

```bash
git add .
git commit -m "feat(ep02): add Prisma schema and Auth.js credentials auth"
git checkout main
git merge ep02-database-auth
# If conflicts: fix on main, then merge main back into ep02-database-auth
git checkout ep02-database-auth
git merge main
git tag ep02-database-auth
```

## Next episode

From updated `main`, create `ep03-interview-sessions` and follow `docs/ep03-interview-sessions.md`.