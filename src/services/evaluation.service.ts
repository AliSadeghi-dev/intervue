import type { InterviewQuestion, InterviewSession } from "@prisma/client";

import { groqChatJson } from "@/lib/ai/groq";
import { parseJsonResponse } from "@/lib/ai/parse-json-response";
import {
  buildEvaluationSystemPrompt,
  buildEvaluationUserPrompt,
} from "@/lib/ai/prompts";
import { applyEvaluationSanityChecks } from "@/lib/ai/evaluation-sanity";
import { answerEvaluationSchema, type AnswerEvaluation } from "@/lib/ai/schemas";
import { getRemainingMinutes } from "@/lib/interview/timing";

export async function evaluateAnswer(
  session: InterviewSession,
  question: InterviewQuestion,
  answerContent: string,
): Promise<AnswerEvaluation> {
  const system = buildEvaluationSystemPrompt();
  const user = buildEvaluationUserPrompt(
    session,
    question,
    answerContent,
    getRemainingMinutes(session),
  );

  const raw = await groqChatJson(system, user);
  const evaluation = parseJsonResponse(raw, answerEvaluationSchema);
  return applyEvaluationSanityChecks(answerContent, evaluation);
}