import type { z } from "zod";

export function parseJsonResponse<T extends z.ZodType>(
  raw: string,
  schema: T,
  normalize?: (value: unknown) => unknown,
): z.infer<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  const normalized = normalize ? normalize(parsed) : parsed;
  return schema.parse(normalized);
}