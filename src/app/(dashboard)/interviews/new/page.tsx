import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewConfigForm } from "@/components/interviews/interview-config-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "New interview",
};

export const instant = false;

export default async function NewInterviewPage() {
  await connection();
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="items-center text-center">
          <CardTitle>Configure your interview</CardTitle>
          <CardDescription className="text-balance">
            Choose your role, level, duration, and mode. Questions and scoring
            are added in the next episode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InterviewConfigForm />
        </CardContent>
      </Card>
    </div>
  );
}