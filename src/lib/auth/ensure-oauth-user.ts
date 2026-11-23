import { prisma } from "@/lib/prisma";

export async function ensureOAuthUser(email: string, name: string) {
  const normalizedEmail = email.toLowerCase();

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name: name.trim() || normalizedEmail,
    },
    create: {
      email: normalizedEmail,
      name: name.trim() || normalizedEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}