import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateNextQuestion } from "@/services/interview-workspace.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await generateNextQuestion(id, session.user.id);

  if (result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.error === "invalid_status") {
    return NextResponse.json(
      { error: "Interview is not in progress" },
      { status: 400 },
    );
  }

  if (result.error === "time_expired") {
    return NextResponse.json({ error: "Interview time has ended" }, { status: 410 });
  }

  if (result.error === "groq_not_configured") {
    return NextResponse.json(
      { error: "AI is not configured. Add GROQ_API_KEY on the server." },
      { status: 503 },
    );
  }

  if (result.error === "generation_failed") {
    return NextResponse.json(
      { error: "Could not generate a question. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    question: {
      id: result.question.id,
      content: result.question.content,
      questionOrder: result.question.questionOrder,
      questionType: result.question.questionType,
    },
    created: result.created,
    remainingSeconds: result.remainingSeconds,
  });
}