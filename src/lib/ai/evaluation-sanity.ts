import type { AnswerEvaluation } from "@/lib/ai/schemas";

const BEGGING_PATTERN =
  /\b(give me|high score|please accept|accept my answer|i need this job|hire me|just pass)\b/i;

const CODE_LIKE_PATTERN =
  /\b(function|const|let|var|react|usestate|useeffect|html|css|api|async|await|typescript|javascript|component|props|hooks)\b/i;

function clamp0to100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Prevent obviously inflated scores when the answer is empty, off-topic, or begging. */
export function applyEvaluationSanityChecks(
  answerContent: string,
  evaluation: AnswerEvaluation,
): AnswerEvaluation {
  const trimmed = answerContent.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const begging = BEGGING_PATTERN.test(trimmed);
  const hasTechnicalSignal =
    CODE_LIKE_PATTERN.test(trimmed) || trimmed.includes("```") || trimmed.includes("=>");

  let maxTechnical = 100;
  let maxCommunication = 100;
  let maxOverall = 100;

  if (begging) {
    maxTechnical = 5;
    maxCommunication = 25;
    maxOverall = 15;
  } else if (wordCount < 8) {
    maxTechnical = 10;
    maxCommunication = 35;
    maxOverall = 20;
  } else if (wordCount < 25 && !hasTechnicalSignal) {
    maxTechnical = 20;
    maxCommunication = 45;
    maxOverall = 30;
  } else if (!hasTechnicalSignal && wordCount < 40) {
    maxTechnical = 35;
    maxCommunication = 55;
    maxOverall = 45;
  }

  return {
    ...evaluation,
    technicalScore: Math.min(clamp0to100(evaluation.technicalScore), maxTechnical),
    communicationScore: Math.min(
      clamp0to100(evaluation.communicationScore),
      maxCommunication,
    ),
    overallScore: Math.min(clamp0to100(evaluation.overallScore), maxOverall),
  };
}