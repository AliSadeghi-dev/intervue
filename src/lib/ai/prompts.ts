import type { InterviewSession, InterviewQuestion, InterviewAnswer } from "@prisma/client";

import {
  formatExperienceLevel,
  formatInterviewMode,
  formatJobRole,
} from "@/lib/interview/labels";

export type RecentQaPair = {
  question: string;
  answer: string;
  technicalScore: number | null;
  communicationScore: number | null;
  overallScore: number | null;
};

export function buildOpeningQuestionSystemPrompt(): string {
  return `You are a senior technical interviewer conducting an English-only job interview.
Generate one clear technical interview question as JSON: { "content": "..." }.
The question must match the candidate's role and experience level.
Ask for explanations, trade-offs, or problem-solving — not trivia.
Do not include markdown fences or extra keys.`;
}

export function buildFollowUpQuestionSystemPrompt(): string {
  return `You are a senior technical interviewer conducting an English-only job interview.
Generate one adaptive follow-up technical question as JSON: { "content": "..." }.
Use prior answers and scores to go deeper when strong, or simplify when answers were weak.
Do not repeat previous questions. No markdown fences or extra keys.`;
}

export function buildEvaluationSystemPrompt(): string {
  return `You are an expert technical interview evaluator.
Return a single JSON object with this exact shape:
{
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "overallScore": 0-100,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingConcepts": ["..."],
  "suggestions": ["..."],
  "explanation": "short paragraph",
  "interviewSummaryUpdate": "rolling summary of the interview so far for future questions (2-4 sentences)"
}
Weight technical accuracy (30%), depth (25%), problem-solving (25%), completeness (20%).
Weight communication: clarity (35%), structure (30%), conciseness (20%), terminology (15%).

Scoring rules (strict):
- Answers with no real technical content, jokes, begging for a high score, or pure filler: technicalScore 0–15, communicationScore 0–30, overallScore 0–20.
- Politeness or enthusiasm alone is NOT communication skill. Do not award high communication scores for non-answers.
- One-word or single-sentence non-answers: stay in the 0–25 overall range unless they contain accurate technical substance.
- Strong scores (70+) require accurate, structured technical content that addresses the question.

Scores are estimates, not judgments of the person. Be honest and specific.`;
}

export function buildQuestionUserPrompt(
  session: InterviewSession,
  remainingMinutes: number,
  recentPairs: RecentQaPair[],
): string {
  const recentBlock =
    recentPairs.length === 0
      ? "No prior questions yet."
      : recentPairs
          .map(
            (pair, index) =>
              `${index + 1}. Q: ${pair.question}\nA: ${pair.answer}\nScores: technical ${pair.technicalScore ?? "n/a"}, communication ${pair.communicationScore ?? "n/a"}, overall ${pair.overallScore ?? "n/a"}`,
          )
          .join("\n\n");

  return `Role: ${formatJobRole(session.jobRole)}
Experience: ${formatExperienceLevel(session.experienceLevel)}
Mode: ${formatInterviewMode(session.interviewMode)}
Remaining time (minutes): ${remainingMinutes}
Session summary so far: ${session.contextSummary ?? "None yet."}

Recent Q&A (newest last):
${recentBlock}`;
}

export function buildEvaluationUserPrompt(
  session: InterviewSession,
  question: InterviewQuestion,
  answerContent: string,
  remainingMinutes: number,
): string {
  return `Role: ${formatJobRole(session.jobRole)}
Experience: ${formatExperienceLevel(session.experienceLevel)}
Mode: ${formatInterviewMode(session.interviewMode)}
Remaining time (minutes): ${remainingMinutes}
Session summary: ${session.contextSummary ?? "None yet."}

Question (${question.questionType}):
${question.content}

Candidate answer:
${answerContent}`;
}

export type QaForContext = InterviewAnswer & { question: InterviewQuestion };

export function buildFinalReportSystemPrompt(): string {
  return `You are an expert technical interview coach producing a final interview report in English.
Return a single JSON object matching the required shape (scores 0-100, arrays of strings, nested technicalAssessment and communicationAssessment objects, and questionReviews for each Q&A pair).
Base every judgment on the provided answers. Avoid generic filler.
questionReviews must align with the supplied questions and answers (use the same order and text).
For unanswered interviews, use low scores and explain that no answers were submitted.
communicationAssessment fields must be English prose strings (not numeric scores). doneWell and couldImprove must be arrays of strings. Required keys: overallScore, technicalScore, communicationScore, summary, strengths, weaknesses, recommendations, technicalAssessment { strongestAreas, weakestAreas, conceptsUnderstoodWell, conceptsToStudy }, communicationAssessment { clarity, structure, conciseness, technicalVocabulary }, questionReviews[] { questionOrder, question, answer, technicalScore, communicationScore, overallScore, doneWell, couldImprove, strongerAnswerExample }.
Do not wrap JSON in markdown.`;
}

export type FinalReportQaInput = {
  questionOrder: number;
  questionType: string;
  question: string;
  answer: string;
  technicalScore: number | null;
  communicationScore: number | null;
  overallScore: number | null;
  evaluationJson: string;
};

export function buildFinalReportUserPrompt(
  session: InterviewSession,
  qa: FinalReportQaInput[],
): string {
  const qaBlock =
    qa.length === 0
      ? "No answers were recorded."
      : qa
          .map(
            (item) =>
              `### Q${item.questionOrder} (${item.questionType})
Question: ${item.question}
Answer: ${item.answer}
Scores: technical ${item.technicalScore ?? "n/a"}, communication ${item.communicationScore ?? "n/a"}, overall ${item.overallScore ?? "n/a"}
Prior evaluation JSON: ${item.evaluationJson}`,
          )
          .join("\n\n");

  return `Role: ${formatJobRole(session.jobRole)}
Experience: ${formatExperienceLevel(session.experienceLevel)}
Mode: ${formatInterviewMode(session.interviewMode)}
Configured duration (minutes): ${session.duration}
Session summary: ${session.contextSummary ?? "None."}

Question and answer transcript:
${qaBlock}`;
}