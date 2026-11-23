const COMMUNICATION_KEYS = [
  "clarity",
  "structure",
  "conciseness",
  "technicalVocabulary",
] as const;

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
}

function toFeedbackString(value: unknown): string {
  if (typeof value === "string" && value.trim().length >= 5) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const score = Math.round(value);
    return `Estimated score: ${score}/100. See overall communication score for more context.`;
  }
  if (value != null) {
    const text = String(value).trim();
    if (text.length >= 5) {
      return text;
    }
  }
  return "Not enough detail was provided for this dimension.";
}

function toScore(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, Math.round(parsed)));
    }
  }
  return fallback;
}

/** Coerce common Groq shape mismatches before Zod validation. */
export function normalizeFinalReportPayload(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const obj = { ...(parsed as Record<string, unknown>) };

  obj.overallScore = toScore(obj.overallScore);
  obj.technicalScore = toScore(obj.technicalScore);
  obj.communicationScore = toScore(obj.communicationScore);

  if (typeof obj.summary === "string") {
    obj.summary = obj.summary.trim();
  }

  obj.strengths = toStringArray(obj.strengths);
  obj.weaknesses = toStringArray(obj.weaknesses);
  obj.recommendations = toStringArray(obj.recommendations);

  if (obj.technicalAssessment && typeof obj.technicalAssessment === "object") {
    const tech = { ...(obj.technicalAssessment as Record<string, unknown>) };
    tech.strongestAreas = toStringArray(tech.strongestAreas);
    tech.weakestAreas = toStringArray(tech.weakestAreas);
    tech.conceptsUnderstoodWell = toStringArray(tech.conceptsUnderstoodWell);
    tech.conceptsToStudy = toStringArray(tech.conceptsToStudy);
    obj.technicalAssessment = tech;
  }

  if (obj.communicationAssessment && typeof obj.communicationAssessment === "object") {
    const comm = { ...(obj.communicationAssessment as Record<string, unknown>) };
    for (const key of COMMUNICATION_KEYS) {
      comm[key] = toFeedbackString(comm[key]);
    }
    obj.communicationAssessment = comm;
  }

  if (Array.isArray(obj.questionReviews)) {
    obj.questionReviews = obj.questionReviews.map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return item;
      }
      const review = { ...(item as Record<string, unknown>) };
      review.questionOrder =
        typeof review.questionOrder === "number"
          ? Math.max(1, Math.round(review.questionOrder))
          : index + 1;
      review.technicalScore = toScore(review.technicalScore);
      review.communicationScore = toScore(review.communicationScore);
      review.overallScore = toScore(review.overallScore);
      review.doneWell = toStringArray(review.doneWell);
      review.couldImprove = toStringArray(review.couldImprove);
      if (typeof review.question === "string") {
        review.question = review.question.trim();
      }
      if (typeof review.answer === "string") {
        review.answer = review.answer.trim();
      }
      if (typeof review.strongerAnswerExample === "string") {
        review.strongerAnswerExample = review.strongerAnswerExample.trim();
      }
      return review;
    });
  }

  return obj;
}