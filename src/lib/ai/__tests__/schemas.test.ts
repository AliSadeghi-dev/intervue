import { answerEvaluationSchema, toMiniFeedback } from "@/lib/ai/schemas";

describe("answerEvaluationSchema", () => {
  it("accepts a well-formed evaluation", () => {
    const payload = {
      technicalScore: 70,
      communicationScore: 75,
      overallScore: 72,
      strengths: ["Mentioned virtualization"],
      weaknesses: ["Shallow on edge cases"],
      missingConcepts: ["memoization"],
      suggestions: ["Compare useMemo vs React.memo"],
      explanation: "The answer explained list rendering trade-offs in enough detail.",
      interviewSummaryUpdate: "Frontend mid-level signals on React lists.",
    };
    expect(answerEvaluationSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects out-of-range scores", () => {
    const payload = {
      technicalScore: 101,
      communicationScore: 50,
      overallScore: 50,
      strengths: ["x"],
      weaknesses: [],
      missingConcepts: [],
      suggestions: ["y"],
      explanation: "Explanation with minimum length.",
      interviewSummaryUpdate: "Summary with minimum length.",
    };
    expect(answerEvaluationSchema.safeParse(payload).success).toBe(false);
  });
});

describe("toMiniFeedback", () => {
  it("maps first strength and suggestion", () => {
    const mini = toMiniFeedback({
      technicalScore: 60,
      communicationScore: 70,
      overallScore: 65,
      strengths: ["Good structure"],
      weaknesses: ["Thin on depth"],
      missingConcepts: [],
      suggestions: ["Add code sample"],
      explanation: "Explanation text here.",
      interviewSummaryUpdate: "Summary text here.",
    });
    expect(mini.strength).toBe("Good structure");
    expect(mini.improvement).toBe("Add code sample");
  });
});