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

  const showWorkspace =
    interview.status === "in_progress" || interview.status === "completed";

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
            {formatExperienceLevel(interview.experienceLevel)} · {interview.duration} minutes ·{" "}
            {formatInterviewMode(interview.interviewMode)}
          </CardDescription>
        </CardHeader>
        {interview.status === "pending" ? (
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Your session is ready. Start the interview when you are prepared. The first
              technical question is generated when the session begins.
            </p>
            <StartInterviewButton sessionId={interview.id} />
          </CardContent>
        ) : null}
      </Card>

      {showWorkspace ? <InterviewWorkspace sessionId={interview.id} /> : null}

      <div className="mt-8">
        <ButtonLink href="/dashboard" variant="ghost" size="sm">
          Back to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}