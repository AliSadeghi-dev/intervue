import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {session.user.name ? `Hi, ${session.user.name}` : "Your dashboard"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your account is set up. Interview configuration and history will
          appear here as those features ship.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle>Start interviewing</CardTitle>
            <CardDescription>
              Choose role, level, duration, and text or voice mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Session setup arrives in the next development milestone.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Past sessions and scores will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No interviews yet. Your history will list completed sessions and
              overall scores.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}