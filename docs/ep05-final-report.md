# Episode 05 — Final Report (`ep05-final-report`)

**Branch:** `ep05-final-report`  
**Base:** `main` (includes Episode 04)  
**Merge target:** `main`

## Episode goal

When an interview is **completed**, generate a Groq-powered **final report** (`InterviewReport`), expose **`GET /api/interviews/[id]/report`**, and render a **report page** with overall scores, assessments, recommendations, and question-by-question review. Update dashboard **average score** and history **View report** links.

**No voice (Episode 6).**

## End-of-episode demo

1. Finish a text interview (let the timer end or run out of time).
2. Click **View full report** on the workspace or **View report** in history.
3. See overall / technical / communication scores, summary, strengths, recommendations, and each Q&A.
4. Dashboard **Average score** updates across completed reports.

## Prerequisites

- Episode 04 merged; `GROQ_API_KEY` set.
- Apply migration: `pnpm db:migrate` (adds report JSON columns).

## Do not build in this episode

- AssemblyAI, microphone, SpeechSynthesis.
- Production deploy polish (Episode 7).

---

## Commands (recording order)

```bash
git checkout main
git checkout -b ep05-final-report
pnpm db:migrate
pnpm dev
```

---

## File creation order

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `prisma/schema.prisma` + migration | `technicalAssessment`, `communicationAssessment`, `questionReviews` on `InterviewReport`. |
| 2 | `src/lib/ai/schemas.ts` | `finalReportSchema` and nested Zod types. |
| 3 | `src/lib/ai/prompts.ts` | Final report system/user prompts. |
| 4 | `src/services/report.service.ts` | Generate, persist, fetch report. |
| 5 | `src/lib/reports/parse-report.ts` | Parse stored JSON for UI. |
| 6 | `src/app/api/interviews/[id]/report/route.ts` | `GET` report (generates if missing). |
| 7 | `src/components/reports/interview-report-view.tsx` | Report UI. |
| 8 | `src/app/(dashboard)/reports/[id]/page.tsx` | Protected report page. |
| 9 | `src/services/interview-workspace.service.ts` | Trigger report after `complete`. |
| 10 | `src/services/interview.service.ts` | Dashboard average + history `include: report`. |
| 11 | `src/components/interviews/interview-history-list.tsx` | Score + View report. |
| 12 | `src/app/(dashboard)/dashboard/page.tsx` | Average score card. |
| 13 | `src/components/interview/interview-workspace.tsx` | Link to report when done. |
| 14 | `src/middleware.ts` / `auth.config.ts` | Protect `/reports`. |
| 15 | `docs/ep05-final-report.md` | This guide. |

---

## Pre-merge checklist

- [ ] Completed interview → report page loads.
- [ ] Report is idempotent (second GET does not duplicate rows).
- [ ] Users cannot open another user's report.
- [ ] `pnpm build` passes.

## Git (you run these)

```bash
git add .
git commit -m "feat(ep05): final interview report and report UI"
git checkout main
git merge ep05-final-report
git checkout ep05-final-report && git merge main
git tag ep05-final-report
```

## Next episode

From `main`, create `ep06-voice` — AssemblyAI + SpeechSynthesis.