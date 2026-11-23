import { createInterviewSessionSchema } from "@/lib/validations/interview";

describe("createInterviewSessionSchema", () => {
  it("accepts valid session input without interview mode", () => {
    const result = createInterviewSessionSchema.safeParse({
      jobRole: "frontend",
      experienceLevel: "mid",
      duration: 15,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown job roles", () => {
    const result = createInterviewSessionSchema.safeParse({
      jobRole: "devops",
      experienceLevel: "junior",
      duration: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid durations", () => {
    const result = createInterviewSessionSchema.safeParse({
      jobRole: "backend",
      experienceLevel: "senior",
      duration: 7,
    });
    expect(result.success).toBe(false);
  });
});