import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createInterviewSessionSchema } from "@/lib/validations/interview";
import {
  createInterviewSession,
  listInterviewSessions,
} from "@/services/interview.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const interviews = await listInterviewSessions(session.user.id);
  return NextResponse.json({ interviews });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createInterviewSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const interview = await createInterviewSession(session.user.id, parsed.data);
  return NextResponse.json({ interview }, { status: 201 });
}