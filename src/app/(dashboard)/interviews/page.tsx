import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewHistoryList } from "@/components/interviews/interview-history-list";
import { ButtonLink } from "@/components/ui/button-link";
import { listInterviewSessions } from "@/services/interview.service";

export const metadata: Metadata = {
  title: "Interview history",
};

export const instant = false;

export default async function InterviewsHistoryPage() {
  await connection();
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const sessions = await listInterviewSessions(session.user.id);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Interview history
          </h1>
          <p className="mt-2 text-muted-foreground">
            Open a session to continue in the workspace or delete sessions you no
            longer need.
          </p>
        </div>
        <ButtonLink href="/interviews/new">Start new interview</ButtonLink>
      </div>

      <InterviewHistoryList sessions={sessions} />
    </div>
  );
}