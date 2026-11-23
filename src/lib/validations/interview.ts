import { z } from "zod";

import {
  EXPERIENCE_LEVELS,
  INTERVIEW_MODES,
  JOB_ROLES,
} from "@/lib/interview/constants";

export const createInterviewSessionSchema = z.object({
  jobRole: z.enum(JOB_ROLES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  duration: z.union([z.literal(10), z.literal(15), z.literal(20)]),
  interviewMode: z.enum(INTERVIEW_MODES),
});

export type CreateInterviewSessionInput = z.infer<
  typeof createInterviewSessionSchema
>;