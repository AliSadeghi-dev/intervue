import { MAX_ANSWER_LENGTH, submitAnswerSchema } from "@/lib/validations/answer";

describe("submitAnswerSchema", () => {
  it("trims and accepts non-empty content", () => {
    const result = submitAnswerSchema.safeParse({
      questionId: "q1",
      content: "  Valid answer  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Valid answer");
    }
  });

  it("rejects empty content after trim", () => {
    const result = submitAnswerSchema.safeParse({
      questionId: "q1",
      content: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over the limit", () => {
    const result = submitAnswerSchema.safeParse({
      questionId: "q1",
      content: "a".repeat(MAX_ANSWER_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });
});