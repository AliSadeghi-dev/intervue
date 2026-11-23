# Episode 07 — Testing (`ep07-testing`)

**Branch:** `ep07-testing`  
**Base:** `main` (includes Episode 06)  
**Merge target:** `main`

## Episode goal

Add **Jest** with **ts-jest** and unit tests for high-risk **lib** code: Groq JSON normalization, evaluation sanity, Zod validations, interview timer math, and question text tokenization for TTS highlight.

No component tests, E2E, or live API calls in this episode.

## End-of-episode demo

1. `pnpm test` — all tests pass.
2. Walk through one failing test in the editor, fix, pass again.
3. `pnpm build` still passes.

## Prerequisites

- Episode 06 merged on `main`.

## Do not build in this episode

- Playwright / Cypress E2E.
- Tests that hit Prisma, Groq, or AssemblyAI over the network.
- Production deploy (next episode).

---

## Commands (recording order)

```bash
git checkout main
git checkout -b ep07-testing
pnpm add -D jest @types/jest ts-jest
pnpm test
pnpm build
```

---

## File creation order

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `jest.config.ts` | ts-jest, `@/` mapper |
| 2 | `src/lib/ai/__tests__/*.test.ts` | normalize, sanity, parse, schemas |
| 3 | `src/lib/validations/__tests__/*.test.ts` | interview + answer Zod |
| 4 | `src/lib/interview/__tests__/timing.test.ts` | Server timer helpers |
| 5 | `src/lib/speech/question-text.ts` | Tokenizer extracted for tests |
| 6 | `src/lib/speech/__tests__/question-text.test.ts` | Highlight char mapping |
| 7 | `docs/ep07-testing.md` | This guide |

---

## Pre-merge checklist

- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm lint` clean (or only pre-existing issues).

## Git (you run these)

```bash
git add .
git commit -m "feat(ep07): add Jest and unit tests for core lib"
git checkout main
git merge ep07-testing
git checkout ep07-testing && git merge main
git tag ep07-testing
```

## Next episode

**ep08-deploy** (or `ep07-deploy` in older notes) — Vercel, env vars, smoke on production.