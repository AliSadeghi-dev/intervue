import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { submitAnswerSchema } from "@/lib/validations/answer";
import { submitInterviewAnswer } from "@/services/interview-workspace.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let input;
  try {
    input = submitAnswerSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await submitInterviewAnswer(id, session.user.id, input);

  if (result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.error === "invalid_status") {
    return NextResponse.json({ error: "Interview is not in progress" }, { status: 400 });
  }

  if (result.error === "time_expired") {
    return NextResponse.json({ error: "Interview time has ended" }, { status: 410 });
  }

  if (result.error === "question_not_found") {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (result.error === "already_answered") {
    return NextResponse.json({ error: "This question was already answered" }, { status: 409 });
  }

  const status = result.evaluationError ? 207 : 200;

  return NextResponse.json(
    {
      answerId: result.answer.id,
      miniFeedback: result.miniFeedback,
      evaluationError: result.evaluationError,
      remainingSeconds: result.remainingSeconds,
      completed: result.completed,
    },
    { status },
  );
}