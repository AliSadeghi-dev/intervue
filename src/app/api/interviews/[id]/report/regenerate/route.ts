import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = session.user.id;

  const interview = await prisma.interviewSession.findFirst({
    where: { id, userId },
    select: { id: true, status: true },
  });

  if (!interview) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (interview.status !== "completed") {
    return NextResponse.json(
      { error: "Interview is not completed yet" },
      { status: 400 },
    );
  }

  await prisma.interviewReport.deleteMany({
    where: { sessionId: id },
  });

  const { getInterviewReport } = await import("@/services/report.service");
  const result = await getInterviewReport(id, userId);

  if ("error" in result && result.error) {
    if (result.error === "not_found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (result.error === "not_completed") {
      return NextResponse.json(
        { error: "Interview is not completed yet" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Could not regenerate report" }, { status: 502 });
  }

  return NextResponse.json({ report: result.report, generated: true });
}