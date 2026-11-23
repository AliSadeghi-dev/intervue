import type { InterviewSession } from "@prisma/client";

export function getRemainingSeconds(session: Pick<InterviewSession, "startedAt" | "duration" | "status">): number {
  if (session.status !== "in_progress" || !session.startedAt) {
    return session.duration * 60;
  }

  const endsAt = session.startedAt.getTime() + session.duration * 60 * 1_000;
  const remainingMs = endsAt - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1_000));
}

export function getRemainingMinutes(session: Pick<InterviewSession, "startedAt" | "duration" | "status">): number {
  return Math.max(1, Math.ceil(getRemainingSeconds(session) / 60));
}

export function isInterviewTimeExpired(
  session: Pick<InterviewSession, "startedAt" | "duration" | "status">,
): boolean {
  return session.status === "in_progress" && getRemainingSeconds(session) <= 0;
}