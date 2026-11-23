# Episode 03 — Interview Sessions (`ep03-interview-sessions`)

**Branch:** `ep03-interview-sessions`  
**Base:** `main` (includes Episode 02)  
**Merge target:** `main`

## Episode goal

Let authenticated users configure a technical interview, persist `InterviewSession` rows in Supabase, start a session (status lifecycle), and browse interview history. **No Groq, no questions, no voice APIs in this episode.**

## End-of-episode demo

1. Log in → open **Dashboard**.
2. Click **Start new interview** → configure role, level, duration, mode → submit.
3. Land on **interview workspace** for that session → click **Start interview** (`pending` → `in_progress`).
4. Open **Interview history** → see the session with status and settings.
5. Try opening another user's session URL (should fail with 404 or forbidden).

## Prerequisites

- Episode 02 merged: auth + Prisma + Supabase migrations applied.
- User logged in for all steps below.

## Do not build in this episode

- Groq, question generation, answers, evaluation.
- AssemblyAI, SpeechSynthesis in the workspace.
- Final reports, scores, or timers beyond storing `startedAt`.

---

## Commands (recording order)

```bash
git checkout main
git checkout -b ep03-interview-sessions
pnpm dlx shadcn@latest add select badge -y
pnpm dev
```

---

## File creation order

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `src/lib/interview/constants.ts` | Allowed values for role, level, duration, mode. |
| 2 | `src/lib/interview/labels.ts` | Human-readable labels for UI. |
| 3 | `src/lib/validations/interview.ts` | Zod schema for creating a session. |
| 4 | `src/lib/interview/get-session-for-user.ts` | Load session by id scoped to `userId`. |
| 5 | `src/services/interview.service.ts` | Create, list, start, delete sessions. |
| 6 | `src/app/api/interviews/route.ts` | `GET` list, `POST` create. |
| 7 | `src/app/api/interviews/[id]/route.ts` | `GET` one, `DELETE` own session. |
| 8 | `src/app/api/interviews/[id]/start/route.ts` | `POST` start (`pending` → `in_progress`). |
| 9 | `src/middleware.ts` | Protect `/interviews` and `/interview` routes. |
| 10 | `src/components/interviews/interview-config-form.tsx` | Configuration form (client). |
| 11 | `src/components/interviews/interview-status-badge.tsx` | Status chip for history. |
| 12 | `src/components/interviews/interview-history-list.tsx` | List UI for sessions. |
| 13 | `src/components/interviews/start-interview-button.tsx` | Start session (client). |
| 14 | `src/app/(dashboard)/dashboard/page.tsx` | Stats + recent sessions + CTA. |
| 15 | `src/app/(dashboard)/interviews/new/page.tsx` | New interview configuration page. |
| 16 | `src/app/(dashboard)/interviews/page.tsx` | Full history page. |
| 17 | `src/app/(dashboard)/interview/[id]/page.tsx` | Workspace shell (placeholder until Episode 04). |
| 18 | `src/components/layout/site-header-actions.tsx` | Link to interview history. |
| 19 | `docs/ep03-interview-sessions.md` | This guide. |

---

## Session status (this episode)

- **Create** → `pending`
- **Start interview** button → `in_progress` + `startedAt`
- `completed` / `abandoned` → Episode 04+

---

## Pre-merge checklist

- [ ] Create → start → history flow works for one user.
- [ ] API returns 401 when logged out; cannot access another user's session.
- [ ] `pnpm build` passes.
- [ ] English-only UI copy.

## Git (you run these)

```bash
git add .
git commit -m "feat(ep03): interview configuration, sessions, and history"
git checkout main
git merge ep03-interview-sessions
git checkout ep03-interview-sessions && git merge main
git tag ep03-interview-sessions
```

## Next episode

From `main`, create `ep04-ai-text-interview` — Groq questions, answers, and timer.