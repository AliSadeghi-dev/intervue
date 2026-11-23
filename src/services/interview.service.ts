import { DEFAULT_INTERVIEW_MODE } from "@/lib/interview/constants";
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
      interviewMode: DEFAULT_INTERVIEW_MODE,
      status: "pending",
    },
  });
}

export async function listInterviewSessions(userId: string) {
  return prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      report: { select: { overallScore: true } },
    },
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
    include: {
      report: { select: { overallScore: true } },
    },
  });

  const totalCount = await prisma.interviewSession.count({
    where: { userId },
  });

  const average = await prisma.interviewReport.aggregate({
    where: { session: { userId } },
    _avg: { overallScore: true },
  });

  return {
    totalCount,
    recentSessions: sessions,
    averageOverallScore: average._avg.overallScore,
  };
}