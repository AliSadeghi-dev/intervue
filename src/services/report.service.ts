import { Prisma } from "@prisma/client";

import { groqChatJson, isGroqConfigured } from "@/lib/ai/groq";
import { parseJsonResponse } from "@/lib/ai/parse-json-response";
import {
  buildFinalReportSystemPrompt,
  buildFinalReportUserPrompt,
  type FinalReportQaInput,
} from "@/lib/ai/prompts";
import { normalizeFinalReportPayload } from "@/lib/ai/normalize-final-report";
import {
  answerEvaluationSchema,
  finalReportSchema,
  type FinalReportPayload,
  type QuestionReview,
} from "@/lib/ai/schemas";
import { prisma } from "@/lib/prisma";

function averageScores(
  answers: { technicalScore: number | null; communicationScore: number | null; overallScore: number | null }[],
) {
  const evaluated = answers.filter((a) => a.overallScore != null);
  if (evaluated.length === 0) {
    return { overallScore: 0, technicalScore: 0, communicationScore: 0 };
  }

  const sum = evaluated.reduce(
    (acc, a) => ({
      technical: acc.technical + (a.technicalScore ?? 0),
      communication: acc.communication + (a.communicationScore ?? 0),
      overall: acc.overall + (a.overallScore ?? 0),
    }),
    { technical: 0, communication: 0, overall: 0 },
  );

  const count = evaluated.length;
  return {
    technicalScore: Math.round(sum.technical / count),
    communicationScore: Math.round(sum.communication / count),
    overallScore: Math.round(sum.overall / count),
  };
}

function questionReviewFromStoredData(item: FinalReportQaInput): QuestionReview {
  let evaluation: ReturnType<typeof answerEvaluationSchema.parse> | null = null;
  if (item.evaluationJson && item.evaluationJson !== "null") {
    try {
      evaluation = answerEvaluationSchema.parse(JSON.parse(item.evaluationJson));
    } catch {
      evaluation = null;
    }
  }

  const technicalScore = Math.min(100, Math.max(0, item.technicalScore ?? 0));
  const communicationScore = Math.min(100, Math.max(0, item.communicationScore ?? 0));
  const overallScore = Math.min(100, Math.max(0, item.overallScore ?? 0));

  if (evaluation) {
    return {
      questionOrder: item.questionOrder,
      question: item.question,
      answer: item.answer,
      technicalScore,
      communicationScore,
      overallScore,
      doneWell: evaluation.strengths.slice(0, 4),
      couldImprove: [...evaluation.weaknesses, ...evaluation.suggestions].slice(0, 4),
      strongerAnswerExample:
        evaluation.explanation.length >= 10
          ? evaluation.explanation
          : "Address the question directly with accurate technical concepts, structure, and a short example.",
    };
  }

  return {
    questionOrder: item.questionOrder,
    question: item.question,
    answer: item.answer,
    technicalScore,
    communicationScore,
    overallScore,
    doneWell: ["Submitted an answer for this question."],
    couldImprove: ["Provide accurate technical detail that directly answers the prompt."],
    strongerAnswerExample:
      "Lead with a concise summary, explain key concepts, mention trade-offs, and give a short concrete example.",
  };
}

function buildFallbackReport(
  qa: FinalReportQaInput[],
  averages: ReturnType<typeof averageScores>,
): FinalReportPayload {
  const questionReviews = qa.map((item) => questionReviewFromStoredData(item));
  const lowPerformance = averages.overallScore < 35;

  return {
    ...averages,
    summary:
      qa.length === 0
        ? "The interview ended without any submitted answers. Start a new session when you are ready to practice."
        : lowPerformance
          ? `You completed ${qa.length} question${qa.length === 1 ? "" : "s"}, but most answers did not demonstrate technical understanding. Overall scores are low. The full AI narrative could not be generated for this session — use per-question feedback below and tap Regenerate report.`
          : `You completed ${qa.length} question${qa.length === 1 ? "" : "s"}. Overall scores average your per-answer evaluations. The full AI narrative could not be generated — use per-question sections below or Regenerate report.`,
    strengths: lowPerformance
      ? ["You finished the timed practice flow, which is useful for getting comfortable with the format."]
      : ["You completed answers across multiple technical questions."],
    weaknesses: lowPerformance
      ? [
          "Answers did not meaningfully address the technical prompts.",
          "Communication scores reflect lack of structured technical explanation, not politeness alone.",
        ]
      : ["Some answers may be missing depth or direct alignment with the questions."],
    recommendations: [
      "Answer each question with a short outline: definition, how it works, trade-off, and example.",
      "Avoid filler or requests for a score — interviewers expect substantive technical content.",
    ],
    technicalAssessment: {
      strongestAreas: lowPerformance ? ["None identified in this session"] : ["See per-question reviews"],
      weakestAreas: lowPerformance
        ? ["Core topics from the interview questions were not answered"]
        : ["Review questions with the lowest technical scores"],
      conceptsUnderstoodWell: [],
      conceptsToStudy: [
        "Target role fundamentals (e.g. React components, props, state, and accessibility for frontend).",
      ],
    },
    communicationAssessment: {
      clarity:
        "Detailed communication narrative unavailable for this session. See per-question scores and regenerate the report for a full write-up.",
      structure:
        "Structure was not consistently used to organize technical ideas.",
      conciseness: "Several responses were very short and off-topic.",
      technicalVocabulary: "Technical vocabulary was minimal across answers.",
    },
    questionReviews,
  };
}

async function loadSessionForReport(sessionId: string, userId: string) {
  return prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      report: true,
      questions: { orderBy: { questionOrder: "asc" } },
      answers: {
        orderBy: { createdAt: "asc" },
        include: { question: true },
      },
    },
  });
}

export async function getInterviewReport(sessionId: string, userId: string) {
  const session = await loadSessionForReport(sessionId, userId);
  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.status !== "completed") {
    return { error: "not_completed" as const };
  }

  if (session.report) {
    return { report: session.report, generated: false };
  }

  const generated = await generateAndSaveReport(sessionId, userId);
  if (generated.error) {
    return generated;
  }

  return { report: generated.report, generated: true };
}

export async function regenerateInterviewReport(sessionId: string, userId: string) {
  const session = await loadSessionForReport(sessionId, userId);
  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.status !== "completed") {
    return { error: "not_completed" as const };
  }

  await prisma.interviewReport.deleteMany({
    where: { sessionId },
  });

  return generateAndSaveReport(sessionId, userId);
}

export async function ensureInterviewReport(sessionId: string, userId: string) {
  const session = await loadSessionForReport(sessionId, userId);
  if (!session || session.userId !== userId) {
    return { error: "not_found" as const };
  }

  if (session.status !== "completed") {
    return { error: "not_completed" as const };
  }

  if (session.report) {
    return { report: session.report };
  }

  return generateAndSaveReport(sessionId, userId);
}

async function generateAndSaveReport(sessionId: string, userId: string) {
  const session = await loadSessionForReport(sessionId, userId);
  if (!session) {
    return { error: "not_found" as const };
  }

  if (session.report) {
    return { report: session.report };
  }

  const answersByQuestion = new Map(session.answers.map((a) => [a.questionId, a]));

  const qa: FinalReportQaInput[] = [];
  for (const question of session.questions) {
    const answer = answersByQuestion.get(question.id);
    if (!answer) {
      continue;
    }
    qa.push({
      questionOrder: question.questionOrder,
      questionType: question.questionType,
      question: question.content,
      answer: answer.content,
      technicalScore: answer.technicalScore,
      communicationScore: answer.communicationScore,
      overallScore: answer.overallScore,
      evaluationJson: answer.evaluation ? JSON.stringify(answer.evaluation) : "null",
    });
  }

  const averages = averageScores(session.answers);
  let payload: FinalReportPayload;

  if (isGroqConfigured()) {
    try {
      const raw = await groqChatJson(
        buildFinalReportSystemPrompt(),
        buildFinalReportUserPrompt(session, qa),
      );
      payload = parseJsonResponse(raw, finalReportSchema, normalizeFinalReportPayload);
    } catch (cause) {
      console.error("Final report generation failed", cause);
      payload = buildFallbackReport(qa, averages);
    }
  } else {
    payload = buildFallbackReport(qa, averages);
  }

  if (payload.strengths.length === 0) {
    payload.strengths = ["You completed a technical interview practice session."];
  }
  if (payload.recommendations.length === 0) {
    payload.recommendations = ["Practice explaining trade-offs aloud for your next session."];
  }

  const existingBeforeSave = await prisma.interviewReport.findUnique({
    where: { sessionId },
  });
  if (existingBeforeSave) {
    return { report: existingBeforeSave };
  }

  try {
    const report = await prisma.interviewReport.create({
      data: {
        sessionId,
        overallScore: payload.overallScore,
        technicalScore: payload.technicalScore,
        communicationScore: payload.communicationScore,
        summary: payload.summary,
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
        recommendations: payload.recommendations,
        technicalAssessment: payload.technicalAssessment as Prisma.InputJsonValue,
        communicationAssessment:
          payload.communicationAssessment as Prisma.InputJsonValue,
        questionReviews: payload.questionReviews as Prisma.InputJsonValue,
      },
    });

    return { report };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const report = await prisma.interviewReport.findUnique({
        where: { sessionId },
      });
      if (report) {
        return { report };
      }
    }
    throw error;
  }
}