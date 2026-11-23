import type { z } from "zod";

export function parseJsonResponse<T extends z.ZodType>(
  raw: string,
  schema: T,
): z.infer<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  return schema.parse(parsed);
}