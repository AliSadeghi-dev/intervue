import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { retryAnswerEvaluation } from "@/services/interview-workspace.service";

type RouteContext = {
  params: Promise<{ id: string; answerId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, answerId } = await context.params;
  const result = await retryAnswerEvaluation(id, session.user.id, answerId);

  if (result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.error === "groq_not_configured") {
    return NextResponse.json(
      { error: "AI is not configured. Add GROQ_API_KEY on the server." },
      { status: 503 },
    );
  }

  if (result.error === "evaluation_failed") {
    return NextResponse.json(
      { error: "Evaluation failed. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    miniFeedback: result.miniFeedback,
    evaluationError: false,
  });
}