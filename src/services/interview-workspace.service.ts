import type { InterviewQuestion } from "@prisma/client";

import { answerEvaluationSchema, toMiniFeedback } from "@/lib/ai/schemas";
import type { RecentQaPair } from "@/lib/ai/prompts";
import { isGroqConfigured } from "@/lib/ai/groq";
import {
  getRemainingSeconds,
  isInterviewTimeExpired,
} from "@/lib/interview/timing";
import { prisma } from "@/lib/prisma";
import type { SubmitAnswerInput } from "@/lib/validations/answer";
import { evaluateAnswer } from "@/services/evaluation.service";
import { generateQuestionContent } from "@/services/question.service";

async function loadOwnedSession(sessionId: string, userId: string) {
  return prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      questions: { orderBy: { questionOrder: "asc" } },
      answers: {
        orderBy: { createdAt: "asc" },
        include: { question: true },
      },
    },
  });
}

async function getUnansweredQuestion(
  sessionId: string,
): Promise<InterviewQuestion | null> {
  return prisma.interviewQuestion.findFirst({
    where: {
      sessionId,
      answers: { none: {} },
    },
    orderBy: { questionOrder: "desc" },
  });
}

type SessionWithRelations = NonNullable<Awaited<ReturnType<typeof loadOwnedSession>>>;

function buildRecentPairs(answers: SessionWithRelations["answers"]): RecentQaPair[] {
  const withContent = answers.filter(
    (a) => a.content && a.overallScore != null,
  );
  const lastThree = withContent.slice(-3);
  return lastThree.map((a) => ({
    question: a.question.content,
    answer: a.content,
    technicalScore: a.technicalScore,
    communicationScore: a.communicationScore,
    overallScore: a.overallScore,
  }));
}

export async function getWorkspaceState(sessionId: string, userId: string) {
  const session = await loadOwnedSession(sessionId, userId);
  if (!session) {
    return { error: "not_found" as const };
  }

  const remainingSeconds = getRemainingSeconds(session);
  const timeExpired = isInterviewTimeExpired(session);

  if (timeExpired && session.status === "in_progress") {
    await completeInterviewSession(sessionId, userId);
    const refreshed = await loadOwnedSession(sessionId, userId);
    if (!refreshed) {
      return { error: "not_found" as const };
    }
    return formatWorkspace(refreshed, 0, true);
  }

  const currentQuestion = await getUnansweredQuestion(sessionId);

  return formatWorkspace(session, remainingSeconds, timeExpired, currentQuestion);
}

function formatWorkspace(
  session: NonNullable<Awaited<ReturnType<typeof loadOwnedSession>>>,
  remainingSeconds: number,
  timeExpired: boolean,
  currentQuestion: InterviewQuestion | null = null,
) {
  const answeredCount = session.answers.length;
  const questionCount = session.questions.length;

  return {
    interview: {
      id: session.id,
      status: session.status,
      jobRole: session.jobRole,
      experienceLevel: session.experienceLevel,
      duration: session.duration,
      interviewMode: session.interviewMode,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    },
    remainingSeconds,
    timeExpired,
    currentQuestion: currentQuestion
      ? {
          id: currentQuestion.id,
          content: currentQuestion.content,
          questionOrder: currentQuestion.questionOrder,
          questionType: currentQuestion.questionType,
        }
      : null,
    questionCount,
    answeredCount,
    groqConfigured: isGroqConfigured(),
  };
}

export async function completeInterviewSession(sessionId: string, userId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.status !== "in_progress") {
    return { error: "invalid_status" as const, session };
  }

  const updated = await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  });

  return { session: updated };
}

export async function generateNextQuestion(sessionId: string, userId: string) {
  const session = await loadOwnedSession(sessionId, userId);
  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.status !== "in_progress") {
    return { error: "invalid_status" as const };
  }

  if (isInterviewTimeExpired(session)) {
    await completeInterviewSession(sessionId, userId);
    return { error: "time_expired" as const };
  }

  const existing = await getUnansweredQuestion(sessionId);
  if (existing) {
    return {
      question: existing,
      created: false,
      remainingSeconds: getRemainingSeconds(session),
    };
  }

  if (!isGroqConfigured()) {
    return { error: "groq_not_configured" as const };
  }

  const nextOrder = session.questions.length + 1;
  const recentPairs = buildRecentPairs(session.answers);

  try {
    const content = await generateQuestionContent(session, nextOrder, recentPairs);
    const question = await prisma.interviewQuestion.create({
      data: {
        sessionId,
        content,
        questionOrder: nextOrder,
        questionType: nextOrder === 1 ? "opening" : "follow_up",
      },
    });

    return {
      question,
      created: true,
      remainingSeconds: getRemainingSeconds(session),
    };
  } catch (cause) {
    console.error("Question generation failed", cause);
    return { error: "generation_failed" as const };
  }
}

export async function submitInterviewAnswer(
  sessionId: string,
  userId: string,
  input: SubmitAnswerInput,
) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.status !== "in_progress") {
    return { error: "invalid_status" as const };
  }

  if (isInterviewTimeExpired(session)) {
    await completeInterviewSession(sessionId, userId);
    return { error: "time_expired" as const };
  }

  const question = await prisma.interviewQuestion.findFirst({
    where: { id: input.questionId, sessionId },
  });

  if (!question) {
    return { error: "question_not_found" as const };
  }

  const existingAnswer = await prisma.interviewAnswer.findFirst({
    where: { questionId: question.id },
  });

  if (existingAnswer) {
    return { error: "already_answered" as const };
  }

  const answer = await prisma.interviewAnswer.create({
    data: {
      sessionId,
      questionId: question.id,
      content: input.content,
    },
  });

  if (!isGroqConfigured()) {
    return {
      answer,
      evaluationError: true,
      miniFeedback: null,
      remainingSeconds: getRemainingSeconds(session),
      completed: false,
    };
  }

  try {
    const evaluation = await evaluateAnswer(session, question, input.content);

    const updatedAnswer = await prisma.interviewAnswer.update({
      where: { id: answer.id },
      data: {
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        overallScore: evaluation.overallScore,
        evaluation,
      },
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { contextSummary: evaluation.interviewSummaryUpdate },
    });

    const refreshed = await prisma.interviewSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    let completed = false;
    if (isInterviewTimeExpired(refreshed)) {
      await completeInterviewSession(sessionId, userId);
      completed = true;
    }

    return {
      answer: updatedAnswer,
      miniFeedback: toMiniFeedback(evaluation),
      evaluationError: false,
      remainingSeconds: getRemainingSeconds(refreshed),
      completed,
    };
  } catch (cause) {
    console.error("Answer evaluation failed", cause);
    return {
      answer,
      evaluationError: true,
      miniFeedback: null,
      remainingSeconds: getRemainingSeconds(session),
      completed: false,
    };
  }
}

export async function retryAnswerEvaluation(
  sessionId: string,
  userId: string,
  answerId: string,
) {
  const answer = await prisma.interviewAnswer.findFirst({
    where: { id: answerId, sessionId, session: { userId } },
    include: { question: true, session: true },
  });

  if (!answer) {
    return { error: "not_found" as const };
  }

  if (answer.overallScore != null && answer.evaluation) {
    const parsed = answerEvaluationSchema.safeParse(answer.evaluation);
    if (parsed.success) {
      return {
        miniFeedback: toMiniFeedback(parsed.data),
        evaluationError: false,
      };
    }
  }

  if (!isGroqConfigured()) {
    return { error: "groq_not_configured" as const };
  }

  try {
    const evaluation = await evaluateAnswer(
      answer.session,
      answer.question,
      answer.content,
    );

    await prisma.interviewAnswer.update({
      where: { id: answer.id },
      data: {
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        overallScore: evaluation.overallScore,
        evaluation,
      },
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { contextSummary: evaluation.interviewSummaryUpdate },
    });

    return {
      miniFeedback: toMiniFeedback(evaluation),
      evaluationError: false,
    };
  } catch (cause) {
    console.error("Evaluation retry failed", cause);
    return { error: "evaluation_failed" as const };
  }
}