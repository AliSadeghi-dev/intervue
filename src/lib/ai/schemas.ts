import { z } from "zod";

export const generatedQuestionSchema = z.object({
  content: z.string().min(10).max(4_000),
});

export const answerEvaluationSchema = z.object({
  technicalScore: z.number().int().min(0).max(100),
  communicationScore: z.number().int().min(0).max(100),
  overallScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string().min(1)).min(1).max(8),
  weaknesses: z.array(z.string().min(1)).max(8),
  missingConcepts: z.array(z.string().min(1)).max(12),
  suggestions: z.array(z.string().min(1)).min(1).max(8),
  explanation: z.string().min(10).max(4_000),
  interviewSummaryUpdate: z.string().min(10).max(2_000),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type AnswerEvaluation = z.infer<typeof answerEvaluationSchema>;

export type EvaluationJson = AnswerEvaluation;

export function toMiniFeedback(evaluation: AnswerEvaluation) {
  return {
    technicalScore: evaluation.technicalScore,
    communicationScore: evaluation.communicationScore,
    overallScore: evaluation.overallScore,
    strength:
      evaluation.strengths[0] ??
      "You addressed parts of the question with relevant technical points.",
    improvement:
      evaluation.suggestions[0] ??
      evaluation.weaknesses[0] ??
      "Add more structure and depth in your next answer.",
  };
}