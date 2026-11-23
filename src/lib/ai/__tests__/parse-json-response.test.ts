import { z } from "zod";

import { parseJsonResponse } from "@/lib/ai/parse-json-response";

const demoSchema = z.object({
  score: z.number(),
  label: z.string(),
});

describe("parseJsonResponse", () => {
  it("parses valid JSON through the schema", () => {
    const result = parseJsonResponse('{"score": 80, "label": "ok"}', demoSchema);
    expect(result).toEqual({ score: 80, label: "ok" });
  });

  it("throws when JSON is invalid", () => {
    expect(() => parseJsonResponse("not json", demoSchema)).toThrow(
      "AI response was not valid JSON",
    );
  });

  it("applies normalize before validation", () => {
    const result = parseJsonResponse('{"score": "77", "label": "x"}', demoSchema, (value) => {
      const obj = value as Record<string, unknown>;
      return { ...obj, score: Number(obj.score) };
    });
    expect(result.score).toBe(77);
  });
});