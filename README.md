# InterviewAI

AI-powered technical interview practice (text and voice). See `implementation.md` for the full product specification.

## Development

```bash
pnpm install
cp .env.example .env
```

Configure `.env`:

- **Supabase:** `DATABASE_URL` (transaction pooler, port 6543) and `DIRECT_URL` (session/direct, port 5432) from **Project Settings → Database**.
- **Auth:** `AUTH_SECRET` — `openssl rand -base64 32`
- **Google OAuth:** `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`; redirect `http://localhost:3000/api/auth/callback/google`

```bash
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Episode build guides live in [`docs/`](./docs/).

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma, Supabase (PostgreSQL).