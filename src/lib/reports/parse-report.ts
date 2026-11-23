import type { InterviewReport } from "@prisma/client";

import {
  communicationAssessmentSchema,
  questionReviewSchema,
  technicalAssessmentSchema,
} from "@/lib/ai/schemas";

export function parseReportDetails(report: InterviewReport) {
  const technicalAssessment = technicalAssessmentSchema.safeParse(
    report.technicalAssessment,
  );
  const communicationAssessment = communicationAssessmentSchema.safeParse(
    report.communicationAssessment,
  );
  const questionReviewsRaw = Array.isArray(report.questionReviews)
    ? report.questionReviews
    : [];

  const questionReviews = questionReviewsRaw
    .map((item) => questionReviewSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);

  const strengths = Array.isArray(report.strengths)
    ? (report.strengths as string[])
    : [];
  const weaknesses = Array.isArray(report.weaknesses)
    ? (report.weaknesses as string[])
    : [];
  const recommendations = Array.isArray(report.recommendations)
    ? (report.recommendations as string[])
    : [];

  return {
    technicalAssessment: technicalAssessment.success
      ? technicalAssessment.data
      : null,
    communicationAssessment: communicationAssessment.success
      ? communicationAssessment.data
      : null,
    questionReviews,
    strengths,
    weaknesses,
    recommendations,
  };
}

/** Shown when final Groq report failed and we saved the basic template. */
export function isPartialReport(report: InterviewReport): boolean {
  const summary = report.summary;
  const comm = report.communicationAssessment;
  const clarity =
    comm &&
    typeof comm === "object" &&
    !Array.isArray(comm) &&
    typeof (comm as { clarity?: unknown }).clarity === "string"
      ? (comm as { clarity: string }).clarity
      : "";

  return (
    summary.startsWith("You completed") ||
    clarity.includes("Not assessed") ||
    (Array.isArray(report.strengths) &&
      (report.strengths as string[]).some((s) => s.includes("You showed up")))
  );
}