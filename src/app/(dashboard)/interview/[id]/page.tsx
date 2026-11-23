import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
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
import {
  formatExperienceLevel,
  formatInterviewMode,
  formatJobRole,
} from "@/lib/interview/labels";

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

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Interview workspace</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {formatJobRole(interview.jobRole)}
          </h1>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>

      <Card className="mb-6 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Session settings</CardTitle>
          <CardDescription>
            {formatExperienceLevel(interview.experienceLevel)} ·{" "}
            {interview.duration} minutes · {formatInterviewMode(interview.interviewMode)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {interview.status === "pending" ? (
            <p>
              Your session is ready. Start the interview when you are prepared.
              AI-generated questions will appear here in Episode 4.
            </p>
          ) : null}
          {interview.status === "in_progress" ? (
            <p>
              This session is in progress. Question prompts, answer input, and
              live feedback will be wired up in the next development milestone.
            </p>
          ) : null}
          {interview.status === "completed" ? (
            <p>This interview is complete. Reports will be available later.</p>
          ) : null}
        </CardContent>
      </Card>

      {interview.status === "pending" ? (
        <StartInterviewButton sessionId={interview.id} />
      ) : null}

      <div className="mt-8">
        <ButtonLink href="/dashboard" variant="ghost" size="sm">
          Back to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}