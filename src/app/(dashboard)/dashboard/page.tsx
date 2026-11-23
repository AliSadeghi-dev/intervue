import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewHistoryList } from "@/components/interviews/interview-history-list";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardSummary } from "@/services/interview.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { totalCount, recentSessions } = await getDashboardSummary(
    session.user.id,
  );

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {session.user.name ? `Hi, ${session.user.name}` : "Your dashboard"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Configure a technical interview, track sessions, and open your
            workspace when you are ready.
          </p>
        </div>
        <ButtonLink href="/interviews/new">Start new interview</ButtonLink>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle>Total interviews</CardTitle>
            <CardDescription>Sessions you have created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle>Average score</CardTitle>
            <CardDescription>Available after AI scoring in Episode 4+</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold text-muted-foreground">
              —
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-bold">Recent interviews</h2>
          <ButtonLink href="/interviews" variant="ghost" size="sm">
            View all
          </ButtonLink>
        </div>
        <InterviewHistoryList sessions={recentSessions} />
      </section>
    </div>
  );
}