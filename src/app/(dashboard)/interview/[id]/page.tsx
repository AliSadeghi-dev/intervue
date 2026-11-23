import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";
import { InterviewStatusBadge } from "@/components/interviews/interview-status-badge";
import { StartInterviewButton } from "@/components/interviews/start-interview-button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionForUser } from "@/lib/interview/get-session-for-user";
import { formatExperienceLevel, formatJobRole } from "@/lib/interview/labels";

export const metadata: Metadata = {
  title: "Interview workspace",
};

export const instant = false;

type InterviewWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

export default async function InterviewWorkspacePage({
  params,
}: InterviewWorkspacePageProps) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const interview = await getSessionForUser(id, session.user.id);

  if (!interview) {
    notFound();
  }

  const showWorkspace =
    interview.status === "in_progress" || interview.status === "completed";
  const inProgress = interview.status === "in_progress";

  return (
    <div className="relative mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.12_265/0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.14_265/0.18),transparent_70%)]"
        aria-hidden
      />

      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Live interview
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
              {formatJobRole(interview.jobRole)}
            </h1>
          </div>
          <InterviewStatusBadge status={interview.status} />
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 backdrop-blur-sm">
            {formatExperienceLevel(interview.experienceLevel)}
          </span>
          <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 backdrop-blur-sm">
            {interview.duration} min
          </span>
          <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 backdrop-blur-sm">
            Type or voice per answer
          </span>
        </div>
      </header>

      {interview.status === "pending" ? (
        <Card className="mb-8 overflow-hidden rounded-3xl border-border/50 shadow-lg shadow-black/[0.03]">
          <CardHeader>
            <CardTitle>Ready when you are</CardTitle>
            <CardDescription>
              Your room is set up. When you start, the first question is generated and the timer
              begins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StartInterviewButton sessionId={interview.id} />
          </CardContent>
        </Card>
      ) : null}

      {showWorkspace ? (
        <div className={inProgress ? undefined : "mt-2"}>
          <InterviewWorkspace sessionId={interview.id} />
        </div>
      ) : null}

      <div className="mt-10 flex justify-center">
        <ButtonLink href="/dashboard" variant="ghost" size="sm" className="rounded-full">
          Back to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}