export const JOB_ROLES = ["frontend", "backend", "full_stack"] as const;
export const EXPERIENCE_LEVELS = ["junior", "mid", "senior"] as const;
export const INTERVIEW_DURATIONS = [10, 15, 20] as const;
export const INTERVIEW_MODES = ["text", "voice"] as const;

export const SESSION_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "abandoned",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type InterviewMode = (typeof INTERVIEW_MODES)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];