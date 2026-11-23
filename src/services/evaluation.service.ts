import type { InterviewQuestion, InterviewSession } from "@prisma/client";

import { groqChatJson } from "@/lib/ai/groq";
import { parseJsonResponse } from "@/lib/ai/parse-json-response";
import {
  buildEvaluationSystemPrompt,
  buildEvaluationUserPrompt,
} from "@/lib/ai/prompts";
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
  return parseJsonResponse(raw, answerEvaluationSchema);
}