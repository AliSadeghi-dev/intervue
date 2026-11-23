# Episode 04 — AI Text Interview (`ep04-ai-text-interview`)

**Branch:** `ep04-ai-text-interview`  
**Base:** `main` (includes Episode 03)  
**Merge target:** `main`

## Episode goal

Integrate **Groq** for English technical interviews in **text mode**: generate opening and follow-up questions, submit answers, evaluate with structured JSON, show **mini feedback**, and end sessions when the configured **server-tracked** duration elapses. **No final report (Episode 5), no voice (Episode 6).**

## End-of-episode demo

1. Set `GROQ_API_KEY` and `GROQ_MODEL` in `.env`.
2. Log in → start or resume an `in_progress` interview.
3. First question appears after **Start interview** (or on resume if one is unanswered).
4. Submit a text answer → see mini scores + strength / improvement bullets.
5. Next question adapts (follow-up).
6. Let the timer reach zero → session becomes **completed** (report placeholder message).
7. Confirm another user cannot call your interview APIs.

## Prerequisites

- Episode 03 merged; session lifecycle works.
- Groq API key with a model you can run (default `openai/gpt-oss-120b` via `GROQ_MODEL`).

## Do not build in this episode

- Final `InterviewReport` generation or report pages.
- AssemblyAI, microphone recording, SpeechSynthesis.
- Dashboard average scores from reports.

---

## Commands (recording order)

```bash
git checkout main
git checkout -b ep04-ai-text-interview
pnpm add openai
pnpm dlx shadcn@latest add textarea alert progress -y
pnpm dev
```

---

## File creation order

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `src/lib/ai/groq-config.ts` | Model name from env. |
| 2 | `src/lib/ai/groq.ts` | OpenAI-compatible Groq client + JSON chat. |
| 3 | `src/lib/ai/schemas.ts` | Zod for question + evaluation JSON. |
| 4 | `src/lib/ai/prompts.ts` | System/user prompt templates. |
| 5 | `src/lib/ai/parse-json-response.ts` | Parse + validate LLM JSON. |
| 6 | `src/lib/interview/timing.ts` | Remaining time from `startedAt` + `duration`. |
| 7 | `src/lib/validations/answer.ts` | Submit answer Zod (8k max). |
| 8 | `src/services/question.service.ts` | Opening / follow-up generation. |
| 9 | `src/services/evaluation.service.ts` | Combined answer evaluation call. |
| 10 | `src/services/interview-workspace.service.ts` | Workspace, submit, complete, retry eval. |
| 11 | `src/app/api/interviews/[id]/workspace/route.ts` | `GET` workspace state. |
| 12 | `src/app/api/interviews/[id]/next-question/route.ts` | `POST` generate or return current question. |
| 13 | `src/app/api/interviews/[id]/answers/route.ts` | `POST` submit answer. |
| 14 | `src/app/api/interviews/[id]/complete/route.ts` | `POST` complete when time ends. |
| 15 | `src/app/api/interviews/[id]/answers/[answerId]/retry-evaluation/route.ts` | `POST` retry failed eval. |
| 16 | `src/components/interview/interview-timer.tsx` | Countdown (synced from server). |
| 17 | `src/components/interview/mini-feedback-card.tsx` | Post-submit mini feedback UI. |
| 18 | `src/components/interview/interview-workspace.tsx` | Main client workspace. |
| 19 | `src/app/(dashboard)/interview/[id]/page.tsx` | Wire workspace into page. |
| 20 | `.env.example` | Add `GROQ_*` placeholders (no real secrets). |
| 21 | `docs/ep04-ai-text-interview.md` | This guide. |

---

## APIs (this episode)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/interviews/[id]/workspace` | Timer, current question, counts |
| POST | `/api/interviews/[id]/next-question` | Groq question |
| POST | `/api/interviews/[id]/answers` | Save answer + evaluate |
| POST | `/api/interviews/[id]/complete` | Mark `completed` |
| POST | `/api/interviews/[id]/answers/[answerId]/retry-evaluation` | Retry Groq eval |

---

## Pre-merge checklist

- [ ] Text interview flow works with valid `GROQ_API_KEY`.
- [ ] Answer saved even if evaluation fails; retry works.
- [ ] Timer ends session (`completed` + `completedAt`).
- [ ] `pnpm build` passes.
- [ ] English-only UI copy.

## Git (you run these)

```bash
git add .
git commit -m "feat(ep04): Groq text interview, evaluation, and timer"
git checkout main
git merge ep04-ai-text-interview
git checkout ep04-ai-text-interview && git merge main
git tag ep04-ai-text-interview
```

## Next episode

From `main`, create `ep05-final-report` — Groq final report + report UI.