"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { InterviewAnswerComposer } from "@/components/interview/interview-answer-composer";
import { MiniFeedbackCard, type MiniFeedback } from "@/components/interview/mini-feedback-card";
import { ButtonLink } from "@/components/ui/button-link";
import { InterviewTimer } from "@/components/interview/interview-timer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InterviewQuestionPanel } from "@/components/interview/interview-question-panel";

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

function questionTypeLabel(type: string): string {
  if (type === "opening") {
    return "Opening";
  }
  if (type === "closing") {
    return "Closing";
  }
  return "Follow-up";
}

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
  const [assemblyAIConfigured, setAssemblyAIConfigured] = useState(true);
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
      assemblyAIConfigured: boolean;
    };

    setInterview(data.interview);
    setRemainingSeconds(data.remainingSeconds);
    setQuestion(data.currentQuestion);
    setQuestionCount(data.questionCount);
    setAnsweredCount(data.answeredCount);
    setGroqConfigured(data.groqConfigured);
    setAssemblyAIConfigured(data.assemblyAIConfigured);
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

  const totalSteps = Math.max(questionCount, answeredCount + (question ? 1 : 0), 1);
  const progressPercent = Math.min(100, (answeredCount / totalSteps) * 100);

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
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Preparing your interview room…</p>
      </div>
    );
  }

  if (completed) {
    return (
      <section className="overflow-hidden rounded-3xl border border-border/50 bg-card p-8 text-center shadow-lg shadow-black/[0.04]">
        <p className="text-sm font-medium text-primary">Session complete</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Nice work</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          You answered {answeredCount} question{answeredCount === 1 ? "" : "s"}. Open your report for
          scores, strengths, and what to practice next.
        </p>
        <ButtonLink href={`/reports/${sessionId}`} size="lg" className="mt-6 rounded-full px-8">
          View full report
        </ButtonLink>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {!groqConfigured ? (
        <Alert variant="destructive">
          <AlertTitle>AI not configured</AlertTitle>
          <AlertDescription>
            Add <code className="text-xs">GROQ_API_KEY</code> to generate questions and evaluate answers.
          </AlertDescription>
        </Alert>
      ) : null}

      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/40 bg-linear-to-r from-card via-card to-muted/30 px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-foreground">
              {answeredCount} answered
            </span>
            {questionCount > 0 ? (
              <span className="rounded-full bg-muted/60 px-2.5 py-0.5">{questionCount} in plan</span>
            ) : null}
            {question ? (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-primary">
                Q{question.questionOrder} · {questionTypeLabel(question.questionType)}
              </span>
            ) : null}
          </div>
          <Progress value={progressPercent} className="h-1 max-w-xs" />
        </div>
        {workspaceReady ? (
          <InterviewTimer
            initialSeconds={remainingSeconds}
            onExpired={() => void handleTimeExpired()}
          />
        ) : null}
      </header>

      {miniFeedback ? <MiniFeedbackCard feedback={miniFeedback} /> : null}

      {evaluationError ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/25 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Your answer was saved, but evaluation failed. You can retry without retyping.
          </p>
          <Button type="button" variant="outline" size="sm" className="w-fit rounded-full" onClick={() => void handleRetryEvaluation()}>
            Retry evaluation
          </Button>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <div className="border-b border-border/40 bg-linear-to-br from-muted/40 via-transparent to-transparent px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Interviewer
          </p>
          {isLoadingQuestion ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Crafting your next question…
            </div>
          ) : question ? (
            <InterviewQuestionPanel questionText={question.content} autoRead />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Waiting for the next question…</p>
          )}
        </div>
      </section>

      {question ? (
        <InterviewAnswerComposer
          sessionId={sessionId}
          questionId={question.id}
          answer={answer}
          onAnswerChange={setAnswer}
          onSubmit={() => void handleSubmit()}
          isSubmitting={isSubmitting}
          speechEnabled={assemblyAIConfigured}
        />
      ) : null}

      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {error && !question ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void loadNextQuestion()}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}