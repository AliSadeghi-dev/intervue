import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAssemblyAIConfigured, transcribeAudio } from "@/lib/speech/assemblyai";
import { validateAudioByteSize } from "@/lib/validations/speech";
import { transcribeRequestFieldsSchema } from "@/lib/validations/speech";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAssemblyAIConfigured()) {
    return NextResponse.json(
      { error: "Speech transcription is not configured on the server." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const sessionId = formData.get("sessionId");
  const questionId = formData.get("questionId");
  const audio = formData.get("audio");

  const fields = transcribeRequestFieldsSchema.safeParse({ sessionId, questionId });
  if (!fields.success) {
    return NextResponse.json({ error: "Invalid session or question" }, { status: 400 });
  }

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio recording" }, { status: 400 });
  }

  if (!validateAudioByteSize(audio.size)) {
    return NextResponse.json(
      { error: "Recording is empty or exceeds 5 MB" },
      { status: 400 },
    );
  }

  const interview = await prisma.interviewSession.findFirst({
    where: {
      id: fields.data.sessionId,
      userId: session.user.id,
      status: "in_progress",
    },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found or not active" }, { status: 404 });
  }

  const question = await prisma.interviewQuestion.findFirst({
    where: { id: fields.data.questionId, sessionId: interview.id },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  try {
    const buffer = await audio.arrayBuffer();
    const transcript = await transcribeAudio(buffer);
    return NextResponse.json({ transcript });
  } catch (cause) {
    console.error("Transcription failed", cause);
    return NextResponse.json(
      { error: "Could not transcribe your recording. Please try again." },
      { status: 502 },
    );
  }
}