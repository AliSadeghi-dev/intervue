"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MiniFeedbackCard, type MiniFeedback } from "@/components/interview/mini-feedback-card";
import { ButtonLink } from "@/components/ui/button-link";
import { InterviewTimer } from "@/components/interview/interview-timer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { MAX_ANSWER_LENGTH } from "@/lib/validations/answer";

type WorkspaceQuestion = {
  id: string;
  content: string;
  questionOrder: number;
  questionType: string;
};

type WorkspaceInterview = {
  id: string;
  status: string;
  duration: number;
  interviewMode: string;
};

type InterviewWorkspaceProps = {
  sessionId: string;
};

export function InterviewWorkspace({ sessionId }: InterviewWorkspaceProps) {
  const router = useRouter();
  const [interview, setInterview] = useState<WorkspaceInterview | null>(null);
  const [question, setQuestion] = useState<WorkspaceQuestion | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answer, setAnswer] = useState("");
  const [miniFeedback, setMiniFeedback] = useState<MiniFeedback | null>(null);
  const [lastAnswerId, setLastAnswerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationError, setEvaluationError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [groqConfigured, setGroqConfigured] = useState(true);
  const [workspaceReady, setWorkspaceReady] = useState(false);

  const syncWorkspace = useCallback(async () => {
    const response = await fetch(`/api/interviews/${sessionId}/workspace`);
    if (!response.ok) {
      setLoadError("Could not load the interview workspace.");
      return;
    }

    const data = (await response.json()) as {
      interview: WorkspaceInterview;
      remainingSeconds: number;
      currentQuestion: WorkspaceQuestion | null;
      questionCount: number;
      answeredCount: number;
      groqConfigured: boolean;
    };

    setInterview(data.interview);
    setRemainingSeconds(data.remainingSeconds);
    setQuestion(data.currentQuestion);
    setQuestionCount(data.questionCount);
    setAnsweredCount(data.answeredCount);
    setGroqConfigured(data.groqConfigured);
    setCompleted(data.interview.status === "completed");
    setLoadError(null);
    setWorkspaceReady(true);
    return data;
  }, [sessionId]);

  const loadNextQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setError(null);
    setMiniFeedback(null);
    setEvaluationError(false);

    const response = await fetch(`/api/interviews/${sessionId}/next-question`, {
      method: "POST",
    });

    if (response.status === 410) {
      setCompleted(true);
      setIsLoadingQuestion(false);
      await syncWorkspace();
      return;
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error ?? "Could not load the next question.");
      setIsLoadingQuestion(false);
      return;
    }

    const data = (await response.json()) as {
      question: WorkspaceQuestion;
      remainingSeconds: number;
    };

    setQuestion(data.question);
    setRemainingSeconds(data.remainingSeconds);
    setAnswer("");
    setIsLoadingQuestion(false);
    await syncWorkspace();
  }, [sessionId, syncWorkspace]);

  useEffect(() => {
    void syncWorkspace();
  }, [syncWorkspace]);

  useEffect(() => {
    if (!interview || completed) {
      return;
    }
    if (interview.status !== "in_progress") {
      return;
    }
    if (question || isLoadingQuestion) {
      return;
    }
  void loadNextQuestion();
  }, [interview, completed, question, isLoadingQuestion, loadNextQuestion]);

  async function handleSubmit() {
    if (!question || !answer.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMiniFeedback(null);
    setEvaluationError(false);

    const response = await fetch(`/api/interviews/${sessionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, content: answer.trim() }),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      miniFeedback?: MiniFeedback | null;
      evaluationError?: boolean;
      answerId?: string;
      remainingSeconds?: number;
      completed?: boolean;
    } | null;

    if (!response.ok && response.status !== 207) {
      setError(payload?.error ?? "Could not submit your answer.");
      setIsSubmitting(false);
      return;
    }

    if (payload?.remainingSeconds != null) {
      setRemainingSeconds(payload.remainingSeconds);
    }

    setAnsweredCount((c) => c + 1);
    setQuestion(null);
    setAnswer("");
    setLastAnswerId(payload?.answerId ?? null);

    if (payload?.miniFeedback) {
      setMiniFeedback(payload.miniFeedback);
    }

    if (payload?.evaluationError) {
      setEvaluationError(true);
    }

    if (payload?.completed) {
      setCompleted(true);
      setIsSubmitting(false);
      router.refresh();
      return;
    }

    setIsSubmitting(false);
    await loadNextQuestion();
  }

  async function handleRetryEvaluation() {
    if (!lastAnswerId) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(
      `/api/interviews/${sessionId}/answers/${lastAnswerId}/retry-evaluation`,
      { method: "POST" },
    );

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      miniFeedback?: MiniFeedback;
    } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Evaluation retry failed.");
      setIsSubmitting(false);
      return;
    }

    if (payload?.miniFeedback) {
      setMiniFeedback(payload.miniFeedback);
      setEvaluationError(false);
    }

    setIsSubmitting(false);
  }

  async function handleTimeExpired() {
    if (completed || !workspaceReady) {
      return;
    }
    await fetch(`/api/interviews/${sessionId}/complete`, { method: "POST" });
    setCompleted(true);
    router.refresh();
  }

  const progressPercent =
    interview && interview.duration > 0
      ? Math.min(100, (answeredCount / Math.max(answeredCount + 1, questionCount || 1)) * 100)
      : 0;

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Workspace unavailable</AlertTitle>
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  if (!workspaceReady) {
    return (
      <Card className="border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Preparing workspace</CardTitle>
          <CardDescription>Loading your session and timer…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (completed) {
    return (
      <Card className="border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Interview complete</CardTitle>
          <CardDescription>
            You answered {answeredCount} question{answeredCount === 1 ? "" : "s"}. Your final report
            includes scores, recommendations, and a per-question review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonLink href={`/reports/${sessionId}`}>View full report</ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!groqConfigured ? (
        <Alert variant="destructive">
          <AlertTitle>AI not configured</AlertTitle>
          <AlertDescription>
            Add <code className="text-xs">GROQ_API_KEY</code> to your server environment to generate
            questions and evaluate answers.
          </AlertDescription>
        </Alert>
      ) : null}

      {interview?.interviewMode === "voice" ? (
        <Alert>
          <AlertTitle>Text mode for this milestone</AlertTitle>
          <AlertDescription>
            Voice recording and text-to-speech ship in Episode 6. Type your answers below for now.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Time remaining</p>
          {workspaceReady ? (
            <InterviewTimer
              initialSeconds={remainingSeconds}
              onExpired={() => void handleTimeExpired()}
            />
          ) : null}
        </div>
        <div className="text-sm text-muted-foreground">
          Question {question?.questionOrder ?? answeredCount + 1}
          {questionCount > 0 ? ` · ${answeredCount} answered` : null}
        </div>
      </div>

      <Progress value={progressPercent} className="h-1.5" />

      {miniFeedback ? <MiniFeedbackCard feedback={miniFeedback} /> : null}

      {evaluationError ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Your answer was saved, but evaluation failed. You can retry without retyping.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void handleRetryEvaluation()}>
            Retry evaluation
          </Button>
        </div>
      ) : null}

      <Card className="border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Current question</CardTitle>
          <CardDescription>
            {isLoadingQuestion
              ? "Generating your next question…"
              : question
                ? `Type ${question.questionType === "opening" ? "an opening" : "a follow-up"} answer below.`
                : "Loading question…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {question ? (
            <p className="whitespace-pre-wrap text-base leading-relaxed">{question.content}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isLoadingQuestion ? "Please wait while the AI prepares a question." : "No question yet."}
            </p>
          )}

          {question ? (
            <>
              <Textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write your answer in English…"
                rows={8}
                maxLength={MAX_ANSWER_LENGTH}
                disabled={isSubmitting}
                aria-label="Your answer"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {answer.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
                </span>
                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || answer.trim().length === 0}
                >
                  {isSubmitting ? "Submitting…" : "Submit answer"}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {error && !question ? (
        <Button type="button" variant="outline" onClick={() => void loadNextQuestion()}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}