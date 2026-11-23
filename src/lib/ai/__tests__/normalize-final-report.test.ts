import { normalizeFinalReportPayload } from "@/lib/ai/normalize-final-report";
import { finalReportSchema } from "@/lib/ai/schemas";

describe("normalizeFinalReportPayload", () => {
  it("coerces string scores and numeric communication fields", () => {
    const raw = {
      overallScore: "72",
      technicalScore: 80.6,
      communicationScore: 65,
      summary: "  Solid session with room to grow.  ",
      strengths: "One strength as string",
      weaknesses: [],
      recommendations: [42, "Read the React docs"],
      technicalAssessment: {
        strongestAreas: ["Hooks"],
        weakestAreas: [],
        conceptsUnderstoodWell: [],
        conceptsToStudy: ["Concurrent features"],
      },
      communicationAssessment: {
        clarity: 88,
        structure: "Well structured",
        conciseness: "ok",
        technicalVocabulary: 70,
      },
      questionReviews: [
        {
          questionOrder: "1",
          question: " Q1 ",
          answer: " A1 ",
          technicalScore: "55",
          communicationScore: 60,
          overallScore: 58,
          doneWell: "Clear opening",
          couldImprove: [],
          strongerAnswerExample: " A stronger example answer here. ",
        },
      ],
    };

    const normalized = normalizeFinalReportPayload(raw) as Record<string, unknown>;
    expect(normalized.overallScore).toBe(72);
    expect(normalized.strengths).toEqual(["One strength as string"]);
    expect(normalized.recommendations).toEqual(["42", "Read the React docs"]);

    const comm = normalized.communicationAssessment as Record<string, string>;
    expect(comm.clarity).toContain("88/100");
    expect(comm.structure).toBe("Well structured");

    const parsed = finalReportSchema.safeParse(normalized);
    expect(parsed.success).toBe(true);
  });

  it("returns non-objects unchanged", () => {
    expect(normalizeFinalReportPayload(null)).toBe(null);
    expect(normalizeFinalReportPayload("text")).toBe("text");
  });
});