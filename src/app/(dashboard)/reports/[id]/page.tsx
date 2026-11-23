import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewReportView } from "@/components/reports/interview-report-view";
import { ButtonLink } from "@/components/ui/button-link";
import { getSessionForUser } from "@/lib/interview/get-session-for-user";
import { getInterviewReport } from "@/services/report.service";

export const metadata: Metadata = {
  title: "Interview report",
};

export const instant = false;

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InterviewReportPage({ params }: ReportPageProps) {
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

  if (interview.status !== "completed") {
    redirect(`/interview/${id}`);
  }

  const result = await getInterviewReport(id, session.user.id);

  if ("error" in result) {
    notFound();
  }

  return (
    <div className="flex-1 bg-linear-to-b from-muted/30 to-background pb-16">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <InterviewReportView sessionId={id} session={interview} report={result.report!} />
        <div className="mt-12 flex flex-wrap justify-center gap-3 border-t border-border/60 pt-8">
          <ButtonLink href="/interviews/new" size="sm">
            Practice again
          </ButtonLink>
          <ButtonLink href="/interviews" variant="outline" size="sm">
            Interview history
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}