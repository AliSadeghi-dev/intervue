import { prisma } from "@/lib/prisma";

export async function getSessionForUser(sessionId: string, userId: string) {
  return prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });
}