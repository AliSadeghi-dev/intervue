import type { InterviewSession } from "@prisma/client";

import { groqChatJson } from "@/lib/ai/groq";
import { parseJsonResponse } from "@/lib/ai/parse-json-response";
import {
  buildFollowUpQuestionSystemPrompt,
  buildOpeningQuestionSystemPrompt,
  buildQuestionUserPrompt,
  type RecentQaPair,
} from "@/lib/ai/prompts";
import { generatedQuestionSchema } from "@/lib/ai/schemas";
import { getRemainingMinutes } from "@/lib/interview/timing";

export async function generateQuestionContent(
  session: InterviewSession,
  questionOrder: number,
  recentPairs: RecentQaPair[],
): Promise<string> {
  const system =
    questionOrder === 1
      ? buildOpeningQuestionSystemPrompt()
      : buildFollowUpQuestionSystemPrompt();

  const user = buildQuestionUserPrompt(
    session,
    getRemainingMinutes(session),
    recentPairs,
  );

  const raw = await groqChatJson(system, user);
  const parsed = parseJsonResponse(raw, generatedQuestionSchema);
  return parsed.content.trim();
}