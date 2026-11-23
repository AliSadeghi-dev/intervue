import type { CreateInterviewSessionInput } from "@/lib/validations/interview";
import { prisma } from "@/lib/prisma";

export async function createInterviewSession(
  userId: string,
  input: CreateInterviewSessionInput,
) {
  return prisma.interviewSession.create({
    data: {
      userId,
      jobRole: input.jobRole,
      experienceLevel: input.experienceLevel,
      duration: input.duration,
      interviewMode: input.interviewMode,
      status: "pending",
    },
  });
}

export async function listInterviewSessions(userId: string) {
  return prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function startInterviewSession(sessionId: string, userId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.status !== "pending") {
    return { error: "invalid_status" as const, session };
  }

  const updated = await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "in_progress",
      startedAt: new Date(),
    },
  });

  return { session: updated };
}

export async function deleteInterviewSession(sessionId: string, userId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    return false;
  }

  await prisma.interviewSession.delete({ where: { id: sessionId } });
  return true;
}

export async function getDashboardSummary(userId: string) {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalCount = await prisma.interviewSession.count({
    where: { userId },
  });

  return {
    totalCount,
    recentSessions: sessions,
  };
}