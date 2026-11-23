import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { startInterviewSession } from "@/services/interview.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await startInterviewSession(id, session.user.id);

  if (result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.error === "invalid_status") {
    return NextResponse.json(
      { error: "Interview cannot be started in its current state" },
      { status: 400 },
    );
  }

  return NextResponse.json({ interview: result.session });
}