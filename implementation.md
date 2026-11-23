# InterviewAI — Product Requirements & Implementation Specification

## 1. Project Overview

**Project Name:** InterviewAI

**Project Type:** Full-Stack AI-Powered Technical Interview Platform

**Primary Goal:** Build an AI-powered platform that allows developers to practice technical job interviews, answer questions using text or voice, and receive detailed feedback about their technical knowledge and communication skills.

InterviewAI simulates a technical interview with an AI interviewer. It generates relevant questions, evaluates the user's answers, adapts subsequent questions based on previous performance, and produces a final interview report.

The application must be built with a modern JavaScript/TypeScript stack. Python must not be used.

A major requirement is to keep the architecture simple, maintainable, and cost-efficient. All external services should use their free tiers wherever available.

## 2. Core Product Requirements

### 2.1 User Experience

The application must support two interview interaction modes:

- **Text Mode:** The user reads questions and submits answers as text.
- **Voice Mode:** The AI reads questions aloud, and the user answers using their microphone.

The application language is English only.

Users must be able to configure an interview before starting.

### 2.2 Interview Configuration

The user should be able to configure:

| Setting            | Options                                                     |
| ------------------ | ----------------------------------------------------------- |
| Job Role           | Frontend Developer, Backend Developer, Full-Stack Developer |
| Experience Level   | Junior, Mid-Level, Senior                                   |
| Interview Duration | 10, 15, 20 minutes                                          |
| Interview Mode     | Text, Voice                                                 |

All interviews must focus exclusively on technical topics.

The selected role and experience level must influence question difficulty and subject matter.

### 2.3 Interview Experience

The interview process should work as follows:

1. The user configures an interview.
2. The application creates a new interview session.
3. The AI generates the first technical question.
4. The user receives the question in text.
5. In voice mode, the browser reads the question aloud.
6. The user submits an answer using text or voice.
7. Voice answers are transcribed into text.
8. The AI evaluates the answer.
9. The next question is generated based on the user's previous answers and performance.
10. The process continues until the configured interview duration is reached (time is the only end condition for MVP; do not use a separate question-count limit).
11. The AI generates a final interview report.

The interview should feel conversational rather than like a static questionnaire.

### 2.4 Adaptive Questions

Questions must be generated dynamically.

The AI should consider:

- The selected job role.
- The selected experience level.
- Previous questions.
- Previous answers.
- Previous evaluation results.
- The remaining interview time.

For example, if a user gives a strong answer about React rendering, the AI may ask a more advanced follow-up question about reconciliation or performance optimization.

If the answer is incomplete, the AI may ask a simpler follow-up question to explore the user's understanding.

Avoid repeating the same questions during one interview session.

## 3. Answer Evaluation

Every answer must be evaluated in two main categories.

### 3.1 Technical Knowledge

Evaluate the user's technical understanding using these criteria:

| Criterion               | Weight |
| ----------------------- | -----: |
| Technical Accuracy      |    30% |
| Technical Depth         |    25% |
| Problem-Solving Ability |    25% |
| Answer Completeness     |    20% |

### 3.2 Communication Skills

Evaluate how effectively the user communicates technical ideas.

| Criterion             | Weight |
| --------------------- | -----: |
| Clarity               |    35% |
| Structure             |    30% |
| Conciseness           |    20% |
| Technical Terminology |    15% |

Communication evaluation should focus on the content and organization of the answer.

Do not treat accent, speaking speed, or voice characteristics as indicators of intelligence or technical ability.

For text answers, communication evaluation should be based on writing clarity and structure.

For voice answers, it should be based on the transcribed response.

### 3.3 Evaluation Output

For each answer, the AI should return structured data containing:

- Technical score (0–100).
- Communication score (0–100).
- Overall score (0–100).
- Strengths.
- Weaknesses.
- Missing technical concepts.
- Suggestions for improvement.
- A short explanation of the evaluation.

Scores are estimates based on the evaluation rubric, not definitive measurements of a person's abilities.

Use structured JSON output and validate it with Zod before saving the evaluation.

Define the canonical evaluation JSON shape in `src/lib/ai/schemas.ts` (Zod schemas) and reuse it for prompts, API validation, and Prisma JSON fields.

## 4. Final Interview Report

After the interview, generate a comprehensive report.

The report should include:

### Overall Performance

- Overall score.
- Technical knowledge score.
- Communication score.
- Performance summary.

### Technical Assessment

- Strongest technical areas.
- Weakest technical areas.
- Concepts the user understands well.
- Concepts that require further study.

### Communication Assessment

- Clarity.
- Structure.
- Conciseness.
- Technical vocabulary.

### Question-by-Question Review

For every question, show:

- The question.
- The user's answer.
- The evaluation scores.
- What was done well.
- What could be improved.
- An example of a stronger answer or important concepts that should have been mentioned.

### Recommendations

Provide actionable recommendations for improving technical interview performance.

Avoid generic feedback. Recommendations should be based on the user's actual answers.

## 5. Technology Stack

The application must use the following stack.

### Frontend

| Technology           | Purpose                      |
| -------------------- | ---------------------------- |
| Next.js (App Router) | Application framework        |
| React                | UI development               |
| TypeScript           | Type safety                  |
| Tailwind CSS         | Styling                      |
| shadcn/ui            | UI components                |
| React Hook Form      | Form management              |
| Zod                  | Validation                   |
| Zustand              | Client-side state management |

Use a clean, modern, professional dashboard design.

The interface should be responsive and work well on desktop and mobile devices.

### Backend

Use Next.js Route Handlers for backend APIs.

Do not create a separate backend application.

Responsibilities include:

- Authentication.
- Interview session management.
- AI interactions.
- Speech transcription.
- Answer evaluation.
- Report generation.
- Database operations.

### Database

| Technology | Purpose                               |
| ---------- | ------------------------------------- |
| PostgreSQL | Primary database                      |
| Prisma ORM | Database access and schema management |

Use PostgreSQL for persistent application data.

For local development, use a local PostgreSQL instance or Docker.

For deployment, use a free managed PostgreSQL tier (for example Neon or Supabase) compatible with Prisma and Vercel.

### Authentication

Use Auth.js for authentication.

For MVP, implement **email and password** using Auth.js credentials provider:

- Register with name, email, and password.
- Login with email and password.
- Store a secure password hash on the User model.

OAuth providers are out of scope for MVP unless explicitly added later.

Protect private routes and ensure users can only access their own interview sessions and reports.

## 6. AI and Speech Providers

Keep external integrations minimal.

Only two external API providers should be required.

### 6.1 Groq — LLM Provider

Groq is the primary AI provider.

Use the Groq API through its OpenAI-compatible API endpoint.

Base URL:

`https://api.groq.com/openai/v1`

Use an OpenAI-compatible SDK configured with the Groq base URL.

The model must be configurable through an environment variable.

Suggested models to evaluate:

- `openai/gpt-oss-120b`
- `openai/gpt-oss-20b`
- Available Qwen models on Groq

Do not hardcode model availability or assume every model is available under the free tier.

Use one configured model for all AI operations initially:

- Technical question generation.
- Follow-up question generation.
- Answer evaluation.
- Final report generation.

Keep prompts organized and separate from business logic.

Use structured outputs wherever possible and validate responses with Zod.

### 6.2 AssemblyAI — Speech-to-Text

Use AssemblyAI for converting user voice recordings into text.

The voice interaction flow:

1. The browser captures audio using the MediaRecorder API.
2. The recorded audio is sent to a protected Next.js backend endpoint.
3. The backend submits the audio to AssemblyAI and receives a transcription job identifier.
4. The backend **polls** AssemblyAI until the job completes or a server-side timeout is reached (suggested: 90 seconds for MVP).
5. The transcript is returned to the client in the same request (no webhooks or background job queue for MVP).
6. The transcript is saved as the user's answer.
7. The answer is evaluated using Groq.

Requirements:

- Support English transcription only.
- Handle transcription failures and polling timeouts gracefully (allow retry or re-record).
- Show recording and transcription states in the UI.
- Never expose the AssemblyAI API key in frontend code.

Use AssemblyAI's current documented API workflow. Handle asynchronous transcription correctly via server-side polling in the Route Handler.

Do not persist the original audio files. Store only the resulting transcript and evaluation data.

### 6.3 Browser SpeechSynthesis — Text-to-Speech

Use the browser's built-in Web Speech API for reading AI-generated questions aloud.

Use:

`window.speechSynthesis`

Requirements:

- English voice output.
- A Play/Pause or Stop control.
- Automatically read new questions in Voice Mode.
- Allow users to replay questions.
- Handle browsers without SpeechSynthesis support gracefully.

No external TTS provider or API key is required.

## 7. Application Architecture

Keep the application modular without introducing unnecessary abstraction.

Suggested project structure:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── interviews/
│   │   ├── interview/
│   │   └── reports/
│   │
│   └── api/
│       ├── interviews/
│       ├── answers/
│       ├── speech/
│       └── reports/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── interview/
│   └── reports/
│
├── features/
│   ├── authentication/
│   ├── interviews/
│   ├── evaluation/
│   └── reports/
│
├── lib/
│   ├── ai/
│   │   ├── groq.ts
│   │   ├── prompts.ts
│   │   └── schemas.ts
│   │
│   ├── speech/
│   │   ├── assemblyai.ts
│   │   └── speech-synthesis.ts
│   │
│   ├── prisma.ts
│   └── utils.ts
│
├── services/
│   ├── interview.service.ts
│   ├── evaluation.service.ts
│   └── report.service.ts
│
└── types/
```

This is a suggested structure. Adjust it when necessary, but avoid creating unnecessary folders, layers, or abstractions.

## 8. Database Design

Use Prisma with PostgreSQL.

Suggested entities:

### User

- id
- name
- email
- passwordHash
- createdAt
- updatedAt

### InterviewSession

- id
- userId
- jobRole
- experienceLevel
- duration
- interviewMode
- status
- contextSummary (optional short text, updated after each evaluated answer for LLM context)
- startedAt
- completedAt
- createdAt
- updatedAt

### InterviewQuestion

- id
- sessionId
- content
- questionOrder
- questionType
- createdAt

### InterviewAnswer

- id
- questionId
- sessionId
- content
- technicalScore
- communicationScore
- overallScore
- evaluation
- createdAt

### InterviewReport

- id
- sessionId
- overallScore
- technicalScore
- communicationScore
- summary
- strengths
- weaknesses
- recommendations
- createdAt

Use appropriate Prisma relations, indexes, and database constraints.

All session and report access must be scoped to the authenticated user.

Store structured evaluation and report fields as JSON where appropriate.

### Enumerations and Session Lifecycle

**InterviewSession.status** (string enum):

| Value         | Meaning                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `pending`     | Session created from configuration; interview not started yet           |
| `in_progress` | Interview started; user may answer questions until duration elapses     |
| `completed`   | User finished or time expired; final report generated or generation ran  |
| `abandoned`   | Optional: explicitly cancelled by user (otherwise keep `in_progress`) |

State transitions:

- `pending` → `in_progress` via start interview.
- `in_progress` → `completed` via complete interview or automatic completion when time is up.
- `in_progress` → `abandoned` only if the product exposes cancel (optional for MVP).

Users may **resume** an `in_progress` session from the dashboard or history until it is `completed` or `abandoned`.

**InterviewQuestion.questionType** (string enum):

| Value      | Meaning                                      |
| ---------- | -------------------------------------------- |
| `opening`  | First question of the session                |
| `follow_up` | Subsequent adaptive questions                |

### Session Resume

If the user closes the tab or loses connectivity during an `in_progress` session, they can return later and continue from the last unanswered question, using server-tracked remaining time.

## 9. API Design

Use Next.js Route Handlers.

Suggested endpoints:

| Method | Endpoint                             | Purpose                      |
| ------ | ------------------------------------ | ---------------------------- |
| POST   | `/api/interviews`                    | Create an interview          |
| GET    | `/api/interviews`                    | Get user's interview history |
| GET    | `/api/interviews/[id]`               | Get interview details        |
| POST   | `/api/interviews/[id]/start`         | Start an interview           |
| POST   | `/api/interviews/[id]/next-question` | Generate the next question   |
| POST   | `/api/interviews/[id]/answers`       | Submit an answer             |
| POST   | `/api/speech/transcribe`             | Transcribe audio             |
| POST   | `/api/interviews/[id]/complete`      | Complete an interview        |
| GET    | `/api/interviews/[id]/report`        | Get the final report         |
| DELETE | `/api/interviews/[id]`               | Delete an interview          |

You may adjust the endpoints if a simpler REST structure is more appropriate.

Do not expose internal provider APIs directly to the frontend.

Validate all incoming requests and verify session ownership before performing operations.

## 10. Main Application Pages

### 10.1 Landing Page

A simple landing page explaining:

- What InterviewAI does.
- How it works.
- Key benefits.
- A call to action to start practicing.

### 10.2 Authentication Pages

- Login.
- Register.

### 10.3 Dashboard

Display:

- Welcome section.
- Start New Interview button.
- Total interviews.
- Average interview score.
- Recent interviews.
- Recent performance overview.

### 10.4 Interview Configuration

A form for selecting:

- Job role.
- Experience level.
- Duration.
- Interview mode.

### 10.5 Interview Workspace

The main interview interface.

It should include:

- Current question.
- Question progress.
- Remaining time.
- Answer input.
- Text/voice interaction.
- Microphone recording controls.
- Transcription status.
- Submit answer button.
- Post-submit evaluation feedback (see below).

Keep the experience focused and distraction-free.

**Evaluation feedback in the workspace:**

- Do **not** show scores or evaluation before the user submits an answer.
- **After** a successful submit and evaluation, show **mini feedback**: technical, communication, and overall scores (0–100), plus one or two short bullets (strength and improvement).
- Do **not** show the full per-answer breakdown (missing concepts, example answer, long explanations) in the workspace; those belong in the final report (Section 4).
- Then load the next question or end the interview when time is up.

### 10.6 Interview Report

Display the complete report with scores, strengths, weaknesses, and recommendations.

Use charts only where they add meaningful value.

### 10.7 Interview History

Show previous interviews with:

- Job role.
- Experience level.
- Date.
- Duration.
- Interview mode.
- Overall score.
- Completion status.

Allow users to open previous reports and delete their own sessions.

## 11. Important Implementation Details

### AI Prompt Design

Create separate prompt templates for:

1. Opening question generation (first question for role and level).
2. Adaptive follow-up question generation.
3. **Combined answer evaluation** (one LLM call that applies both the technical and communication rubrics and returns a single structured JSON object).
4. Final report generation.

Do not split technical and communication evaluation into two LLM calls for MVP unless there is a measured quality issue.

Prompts must contain the relevant interview context.

**Context window for adaptive questions and evaluation:**

- Always include: job role, experience level, interview mode, remaining time.
- Include the **last three** question-and-answer pairs with their evaluation scores.
- Optionally include a short **rolling summary** of the interview so far (updated after each answer and stored on the session) instead of full transcript history.
- Do not send the entire interview history to the LLM on every request.

Keep the output format predictable and validate it.

### Interview Timing

The interview duration should be controlled by the application.

Track the start time and calculate remaining time on the server.

Do not rely exclusively on a frontend countdown.

Avoid generating a new question if the interview has already reached its time limit.

### Error Handling

Handle:

- Groq API errors.
- AssemblyAI API errors.
- Invalid AI responses.
- Network failures.
- Microphone permission errors.
- Unsupported browser features.
- Authentication failures.
- Database errors.

Show understandable error messages to users.

Do not lose an answer if its evaluation request fails. Save the answer first, then perform evaluation so it can be retried.

### Security

- Keep all API keys on the server.
- Use environment variables.
- Validate all API inputs with Zod.
- Protect private endpoints.
- Verify ownership of every interview session.
- Add basic rate limiting to expensive AI and speech endpoints.
- Enforce answer limits: text answers max **8,000 characters**; voice recordings max **120 seconds** per answer; reject oversized audio uploads (suggested max **5 MB**).
- Do not store original audio recordings.
- Never expose internal prompts or provider credentials to the client.

## 12. Environment Variables

Create a `.env.example` file.

Suggested variables:

```env
DATABASE_URL=

AUTH_SECRET=

GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b

ASSEMBLYAI_API_KEY=
```

Add any additional variables required by the selected Auth.js configuration.

Never commit real credentials.

## 13. Cost Requirements

The project must prioritize free services.

Required provider configuration:

| Service  | Provider                | Cost Strategy                                      |
| -------- | ----------------------- | -------------------------------------------------- |
| LLM      | Groq                    | Use available free quota where eligible            |
| STT      | AssemblyAI              | Use available free tier                            |
| TTS      | Browser SpeechSynthesis | Built into supported browsers                      |
| Database | PostgreSQL              | Local or Docker for dev; Neon or Supabase free tier for deployment |
| Hosting  | Vercel                  | Free tier for development/demo where eligible      |

Important:

Free tiers have usage limits and may change. Do not assume unlimited usage.

The application should display clear errors when a provider quota is exhausted.

Do not silently switch to a paid service.

## 14. UI/UX Direction

The design should feel like a modern SaaS product.

Design principles:

- Clean and minimal interface.
- Professional dashboard.
- Clear typography and visual hierarchy.
- Consistent spacing.
- Responsive layouts.
- Accessible components.
- Good loading and empty states.
- Clear feedback during AI generation and speech transcription.

The interview workspace is the most important screen and should receive the most design attention.

Avoid unnecessary animations, decorative elements, and complicated navigation.

## 15. Development Priorities

Implement the project incrementally.

### Phase 1 — Foundation

- Initialize Next.js and TypeScript.
- Configure Tailwind CSS and shadcn/ui.
- Configure Prisma and PostgreSQL.
- Implement Auth.js email/password registration and login.
- Build the main application layout.

### Phase 2 — Interview Management

- Build the dashboard.
- Implement interview configuration.
- Create interview sessions.
- Implement interview history.

### Phase 3 — AI Interview Engine

- Integrate Groq.
- Implement question generation.
- Implement answer submission.
- Implement technical and communication evaluation.
- Implement adaptive question generation.

### Phase 4 — Voice Features

- Integrate AssemblyAI.
- Implement browser audio recording.
- Implement speech transcription.
- Integrate browser SpeechSynthesis.
- Connect voice interactions to the interview flow.

### Phase 5 — Reports and Polish

- Implement final report generation.
- Build report pages.
- Add performance summaries.
- Improve loading and error states.
- Test the complete interview flow.
- Add Zod schema tests for AI evaluation and report JSON shapes.
- Add at least one automated smoke test for the text-mode interview path (optional but recommended).

## 16. Acceptance Criteria

The MVP is considered complete when:

- A user can register and log in with email and password.
- A user can configure and start a technical interview.
- The interview supports Frontend, Backend, and Full-Stack roles.
- The interview supports Junior, Mid-Level, and Senior levels.
- Users can choose between text and voice modes.
- Groq generates relevant technical questions.
- Voice questions can be read aloud using browser SpeechSynthesis.
- Users can record answers using their microphone.
- AssemblyAI transcribes voice answers into English text.
- Groq evaluates each answer in one structured call using both evaluation categories.
- After each answer, the workspace shows mini feedback; the report shows full per-question detail.
- Follow-up questions adapt to previous answers.
- The interview ends when the configured duration elapses (no separate question-count cap).
- An in-progress interview can be resumed until completed.
- A final report is generated.
- Users can view their interview history and previous reports.
- Users cannot access other users' private data.
- No paid API or subscription is required for the intended free-tier demo workflow.

## 17. Instructions for Cursor

Act as a senior full-stack engineer.

Read this specification carefully before implementing the application.

Follow these instructions:

1. Use TypeScript throughout the project.
2. Do not use Python.
3. Do not introduce a separate backend application.
4. Keep the architecture simple and maintainable.
5. Use the specified technology stack unless there is a strong technical reason to change something.
6. Do not introduce unnecessary libraries or external providers.
7. Keep Groq and AssemblyAI integrations isolated in their respective modules.
8. Use browser SpeechSynthesis for TTS instead of adding another external provider.
9. Never expose API keys in client-side code.
10. Validate AI-generated structured responses before using or persisting them.
11. Implement proper loading, error, and empty states.
12. Prioritize a fully working end-to-end MVP over unnecessary features.

### Implementation Workflow

Before writing code:

1. Inspect the existing repository.
2. Identify the current project structure and installed dependencies.
3. Present a short implementation plan.
4. Identify any missing configuration or credentials.

Then implement the project incrementally.

After each major phase:

- Verify TypeScript types.
- Run linting and relevant tests.
- Fix errors before proceeding.
- Keep the application runnable.

Do not generate the entire application as one large, unstructured code change.

The final result should be a polished, functional technical interview practice platform with a reliable text and voice interview experience.
