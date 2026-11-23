import type { ComponentType } from "react";

import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";

import { RegenerateReportButton } from "@/components/reports/regenerate-report-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isPartialReport, parseReportDetails } from "@/lib/reports/parse-report";
import type { InterviewReport, InterviewSession } from "@prisma/client";
import {
  formatExperienceLevel,
  formatInterviewMode,
  formatJobRole,
} from "@/lib/interview/labels";
import type { QuestionReview } from "@/lib/ai/schemas";

type InterviewReportViewProps = {
  sessionId: string;
  session: Pick<
    InterviewSession,
    "jobRole" | "experienceLevel" | "duration" | "interviewMode" | "completedAt"
  >;
  report: InterviewReport;
};

function scoreTone(score: number): {
  text: string;
  ring: string;
  badge: "default" | "secondary" | "destructive" | "outline";
  label: string;
} {
  if (score < 30) {
    return {
      text: "text-destructive",
      ring: "#ef4444",
      badge: "destructive",
      label: "Needs work",
    };
  }
  if (score < 60) {
    return {
      text: "text-amber-600 dark:text-amber-500",
      ring: "#d97706",
      badge: "secondary",
      label: "Developing",
    };
  }
  return {
    text: "text-foreground",
    ring: "oklch(0.205 0 0)",
    badge: "default",
    label: "Strong",
  };
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const tone = scoreTone(value);
  const degrees = Math.max(0, Math.min(100, value)) * 3.6;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
      <div
        className="relative size-[7.5rem] rounded-full p-1"
        style={{
          background: `conic-gradient(${tone.ring} ${degrees}deg, var(--muted) ${degrees}deg)`,
        }}
      >
        <div className="flex size-full flex-col items-center justify-center rounded-full bg-card">
          <span className={`font-heading text-3xl font-bold tabular-nums ${tone.text}`}>
            {value}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{label}</p>
      <Badge variant={tone.badge} className="mt-1">
        {tone.label}
      </Badge>
    </div>
  );
}

function BulletInsight({
  icon: Icon,
  title,
  items,
  variant,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  variant: "positive" | "caution" | "neutral";
}) {
  const shell =
    variant === "positive"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : variant === "caution"
        ? "border-amber-500/25 bg-amber-500/5"
        : "border-border/80 bg-muted/30";

  return (
    <Card className={`shadow-none ${shell}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 shrink-0 opacity-80" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/90">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                className={
                  variant === "positive"
                    ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500"
                    : variant === "caution"
                      ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500"
                      : "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                }
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const tone = scoreTone(value);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium tabular-nums ${tone.text}`}
    >
      {label} {value}
    </span>
  );
}

function QuestionReviewCard({ item }: { item: QuestionReview }) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <div className="h-1 w-full bg-linear-to-r from-primary/80 via-primary/40 to-transparent" />
      <CardHeader className="space-y-3 bg-muted/20 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            Question {item.questionOrder}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <ScorePill label="Tech" value={item.technicalScore} />
            <ScorePill label="Comm" value={item.communicationScore} />
            <ScorePill label="Overall" value={item.overallScore} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5 text-sm">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Question
          </p>
          <p className="rounded-xl border border-border/60 bg-muted/25 p-4 leading-relaxed text-foreground">
            {item.question}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Your answer
          </p>
          <p className="rounded-xl border border-dashed border-border/80 bg-background p-4 leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" />
              Done well
            </p>
            <ul className="space-y-1.5 text-muted-foreground">
              {item.doneWell.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <Wrench className="size-3.5" />
              Could improve
            </p>
            <ul className="space-y-1.5 text-muted-foreground">
              {item.couldImprove.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Lightbulb className="size-3.5" />
            Stronger answer example
          </p>
          <p className="leading-relaxed text-muted-foreground">{item.strongerAnswerExample}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewReportView({ sessionId, session, report }: InterviewReportViewProps) {
  const details = parseReportDetails(report);
  const partial = isPartialReport(report);
  const completedLabel = session.completedAt
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
        session.completedAt,
      )
    : null;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-muted/50 via-card to-muted/30 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" />
              Interview report
            </Badge>
            {partial ? <Badge variant="secondary">Basic summary</Badge> : null}
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {formatJobRole(session.jobRole)}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{formatExperienceLevel(session.experienceLevel)}</Badge>
            <Badge variant="secondary">{session.duration} min</Badge>
            <Badge variant="secondary">{formatInterviewMode(session.interviewMode)}</Badge>
            {completedLabel ? (
              <span className="self-center text-xs">Completed {completedLabel}</span>
            ) : null}
          </div>
        </div>
      </section>

      {partial ? (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertTitle>Basic report</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              The full AI narrative could not be saved earlier. Scores below still reflect your
              per-answer grades. Regenerate for an updated write-up.
            </p>
            <RegenerateReportButton sessionId={sessionId} />
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">Your scores</h2>
          <p className="hidden text-xs text-muted-foreground sm:block">
            0–29 needs work · 30–59 developing · 60+ strong
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ScoreRing label="Overall" value={report.overallScore} />
          <ScoreRing label="Technical" value={report.technicalScore} />
          <ScoreRing label="Communication" value={report.communicationScore} />
        </div>
      </section>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="size-5 opacity-80" />
            Performance summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/90">{report.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <BulletInsight
          icon={CheckCircle2}
          title="Strengths"
          items={details.strengths}
          variant="positive"
        />
        <BulletInsight
          icon={Wrench}
          title="Areas to improve"
          items={
            details.weaknesses.length > 0
              ? details.weaknesses
              : ["No major weaknesses highlighted in this session."]
          }
          variant="caution"
        />
      </div>

      {details.technicalAssessment ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5 opacity-80" />
              Technical assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {(
              [
                ["Strongest areas", details.technicalAssessment.strongestAreas],
                ["Weakest areas", details.technicalAssessment.weakestAreas],
                ["Understood well", details.technicalAssessment.conceptsUnderstoodWell],
                ["Study next", details.technicalAssessment.conceptsToStudy],
              ] as const
            ).map(([title, items]) => (
              <div key={title}>
                <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
                {items.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {details.communicationAssessment ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="size-5 opacity-80" />
              Communication assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Clarity", details.communicationAssessment.clarity],
                ["Structure", details.communicationAssessment.structure],
                ["Conciseness", details.communicationAssessment.conciseness],
                ["Terminology", details.communicationAssessment.technicalVocabulary],
              ] as const
            ).map(([label, text]) => (
              <div
                key={label}
                className="rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {label}
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <BulletInsight
        icon={Lightbulb}
        title="Recommendations"
        items={details.recommendations}
        variant="neutral"
      />

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <h2 className="font-heading text-xl font-bold whitespace-nowrap">
            Question-by-question
          </h2>
          <Separator className="flex-1" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {details.questionReviews.length} answered question
          {details.questionReviews.length === 1 ? "" : "s"}
        </p>
        {details.questionReviews.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No answered questions in this session.
          </p>
        ) : (
          <div className="space-y-6">
            {details.questionReviews.map((item) => (
              <QuestionReviewCard key={item.questionOrder} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}