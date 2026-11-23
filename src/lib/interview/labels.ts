import type {
  ExperienceLevel,
  InterviewMode,
  JobRole,
  SessionStatus,
} from "@/lib/interview/constants";

const jobRoleLabels: Record<JobRole, string> = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  full_stack: "Full-Stack Developer",
};

const experienceLabels: Record<ExperienceLevel, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
};

const modeLabels: Record<InterviewMode, string> = {
  text: "Text",
  voice: "Voice",
};

const statusLabels: Record<SessionStatus, string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export function formatJobRole(role: string) {
  return jobRoleLabels[role as JobRole] ?? role;
}

export function formatExperienceLevel(level: string) {
  return experienceLabels[level as ExperienceLevel] ?? level;
}

export function formatInterviewMode(mode: string) {
  return modeLabels[mode as InterviewMode] ?? mode;
}

export function formatSessionStatus(status: string) {
  return statusLabels[status as SessionStatus] ?? status;
}