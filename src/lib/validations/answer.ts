import { z } from "zod";

export const MAX_ANSWER_LENGTH = 8_000;

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  content: z.string().trim().min(1).max(MAX_ANSWER_LENGTH),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;