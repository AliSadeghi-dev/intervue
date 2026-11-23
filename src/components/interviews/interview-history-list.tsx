import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { DeleteInterviewButton } from "@/components/interviews/delete-interview-button";
import { InterviewStatusBadge } from "@/components/interviews/interview-status-badge";
import {
  formatExperienceLevel,
  formatInterviewMode,
  formatJobRole,
} from "@/lib/interview/labels";

export type InterviewListItem = {
  id: string;
  jobRole: string;
  experienceLevel: string;
  duration: number;
  interviewMode: string;
  status: string;
  createdAt: Date;
  report?: { overallScore: number } | null;
};

type InterviewHistoryListProps = {
  sessions: InterviewListItem[];
  emptyMessage?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function InterviewHistoryList({
  sessions,
  emptyMessage = "No interviews yet. Start your first practice session.",
}: InterviewHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed">{emptyMessage}</p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border/70 bg-background">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/interview/${session.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {formatJobRole(session.jobRole)}
              </Link>
              <InterviewStatusBadge status={session.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatExperienceLevel(session.experienceLevel)} · {session.duration}{" "}
              min · {formatInterviewMode(session.interviewMode)}
            </p>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(session.createdAt)}
              {session.report ? ` · Overall score ${session.report.overallScore}` : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session.status === "completed" ? (
              <ButtonLink href={`/reports/${session.id}`} size="sm" variant="outline">
                View report
              </ButtonLink>
            ) : (
              <ButtonLink href={`/interview/${session.id}`} size="sm" variant="outline">
                Open workspace
              </ButtonLink>
            )}
            <DeleteInterviewButton sessionId={session.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}