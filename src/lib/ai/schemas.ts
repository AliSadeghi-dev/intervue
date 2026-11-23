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

const proseAssessmentField = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      const score = Math.round(value);
      return `Estimated score: ${score}/100. Expand with specific examples from the interview.`;
    }
    const text = String(value).trim();
    return text.length >= 5
      ? text
      : "Not enough detail was provided for this dimension.";
  })
  .pipe(z.string().min(5).max(2_000));

const stringListField = z
  .union([z.array(z.union([z.string(), z.number()])), z.string(), z.number()])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    }
    if (typeof value === "string" && value.trim().length > 0) {
      return [value.trim()];
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return [`Score: ${Math.round(value)}/100`];
    }
    return [];
  })
  .pipe(z.array(z.string().min(1)).max(12));

const score0to100 = z
  .union([z.number(), z.string()])
  .transform((value) => {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(n)));
  })
  .pipe(z.number().int().min(0).max(100));

export const communicationAssessmentSchema = z.object({
  clarity: proseAssessmentField,
  structure: proseAssessmentField,
  conciseness: proseAssessmentField,
  technicalVocabulary: proseAssessmentField,
});

export const technicalAssessmentSchema = z.object({
  strongestAreas: stringListField,
  weakestAreas: stringListField,
  conceptsUnderstoodWell: stringListField,
  conceptsToStudy: stringListField,
});

const feedbackBulletList = stringListField.pipe(z.array(z.string().min(1)).max(8));

export const questionReviewSchema = z.object({
  questionOrder: z
    .union([z.number(), z.string()])
    .transform((value) => {
      const n = typeof value === "number" ? value : Number(value);
      return Math.max(1, Math.round(Number.isFinite(n) ? n : 1));
    })
    .pipe(z.number().int().positive()),
  question: z.string().min(1),
  answer: z.string().min(1),
  technicalScore: score0to100,
  communicationScore: score0to100,
  overallScore: score0to100,
  doneWell: feedbackBulletList,
  couldImprove: feedbackBulletList,
  strongerAnswerExample: z.string().min(10).max(4_000),
});

export const finalReportSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  technicalScore: z.number().int().min(0).max(100),
  communicationScore: z.number().int().min(0).max(100),
  summary: z.string().min(20).max(8_000),
  strengths: z.array(z.string().min(1)).min(1).max(12),
  weaknesses: z.array(z.string().min(1)).max(12),
  recommendations: z.array(z.string().min(1)).min(1).max(12),
  technicalAssessment: technicalAssessmentSchema,
  communicationAssessment: communicationAssessmentSchema,
  questionReviews: z.array(questionReviewSchema).max(50),
});

export type FinalReportPayload = z.infer<typeof finalReportSchema>;
export type QuestionReview = z.infer<typeof questionReviewSchema>;
export type TechnicalAssessment = z.infer<typeof technicalAssessmentSchema>;
export type CommunicationAssessment = z.infer<typeof communicationAssessmentSchema>;

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