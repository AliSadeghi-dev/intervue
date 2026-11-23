import { z } from "zod";

import {
  EXPERIENCE_LEVELS,
  INTERVIEW_DURATIONS,
  INTERVIEW_MODES,
  JOB_ROLES,
} from "@/lib/interview/constants";

export const createInterviewSessionSchema = z.object({
  jobRole: z.enum(JOB_ROLES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  duration: z.union(
    INTERVIEW_DURATIONS.map((minutes) => z.literal(minutes)) as [
      z.ZodLiteral<(typeof INTERVIEW_DURATIONS)[number]>,
      z.ZodLiteral<(typeof INTERVIEW_DURATIONS)[number]>,
      ...z.ZodLiteral<(typeof INTERVIEW_DURATIONS)[number]>[],
    ],
  ),
  interviewMode: z.enum(INTERVIEW_MODES),
});

export type CreateInterviewSessionInput = z.infer<
  typeof createInterviewSessionSchema
>;