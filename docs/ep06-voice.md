# Episode 06 — Voice Interview (`ep06-voice`)

**Branch:** `ep06-voice`  
**Base:** `main` (includes Episode 05)  
**Merge target:** `main`

## Episode goal

Enable **hybrid answers** in every interview: browser **SpeechSynthesis** for questions (optional listen), **MediaRecorder** + **AssemblyAI** when the candidate records, or **typed** text — per question, without choosing a mode at setup. Groq evaluate / report runs on the final text either way.

## End-of-episode demo

1. Set `ASSEMBLYAI_API_KEY` in `.env`.
2. Create any interview (no mode picker).
3. Start → question auto-reads (or **Listen**).
4. **Write** or **Record** → transcript merges into the answer box → edit → **Submit answer**.
5. Mini feedback and final report behave the same for typed and recorded answers.

## Prerequisites

- Episodes 04–05 merged.
- Modern Chromium/Safari with `getUserMedia` + `speechSynthesis`.

## Do not build in this episode

- Production deploy (Episode 7).
- Storing audio files (transcript only).

---

## Commands (recording order)

```bash
git checkout main
git checkout -b ep06-voice
pnpm dev
```

---

## File creation order

| # | File / path | Purpose |
|---|-------------|---------|
| 1 | `src/lib/speech/constants.ts` | Limits (5 MB, 120s, 90s poll). |
| 2 | `src/lib/speech/assemblyai.ts` | Upload, submit, poll transcript. |
| 3 | `src/lib/speech/speech-synthesis.ts` | Client TTS helpers. |
| 4 | `src/lib/validations/speech.ts` | Transcribe form validation. |
| 5 | `src/app/api/speech/transcribe/route.ts` | Protected transcribe endpoint. |
| 6 | `src/components/interview/question-speech-controls.tsx` | Listen / Stop. |
| 7 | `src/components/interview/voice-recorder.tsx` | Record + transcribe into answer. |
| 8 | `src/components/interview/interview-answer-composer.tsx` | Write / Record tabs + shared textarea. |
| 9 | `src/components/interview/interview-workspace.tsx` | Unified question + composer UI. |
| 10 | `src/services/interview-workspace.service.ts` | `assemblyAIConfigured` flag. |
| 11 | `docs/ep06-voice.md` | This guide. |

---

## Pre-merge checklist

- [ ] Record → transcribe → submit → report.
- [ ] Typed answers on the same session work.
- [ ] `pnpm build` passes.

## Git (you run these)

```bash
git add .
git commit -m "feat(ep06): voice mode with AssemblyAI and speech synthesis"
```

## Next episode

**ep07-deploy** — Vercel, env vars, polish.