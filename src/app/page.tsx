import Link from "next/link";
import { Mic, MessageSquare, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    title: "Configure your interview",
    description:
      "Choose your role, experience level, duration, and text or voice mode.",
  },
  {
    title: "Answer technical questions",
    description:
      "Respond by typing or speaking. Voice answers are transcribed before evaluation.",
  },
  {
    title: "Review your report",
    description:
      "See scores, strengths, gaps, and actionable recommendations after the session.",
  },
] as const;

const benefits = [
  {
    icon: Sparkles,
    title: "Adaptive follow-ups",
    description:
      "Questions adjust to your prior answers so the session feels like a real interview.",
  },
  {
    icon: MessageSquare,
    title: "Technical and communication scores",
    description:
      "Each answer is rated on knowledge depth and how clearly you explain ideas.",
  },
  {
    icon: Mic,
    title: "Text or voice practice",
    description:
      "Train written responses or practice speaking under time pressure.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border/60 bg-linear-to-b from-muted/40 to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            AI-powered interview practice
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
            Sharpen your technical interviews before the real hiring loop
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            InterviewAI simulates a technical interview with adaptive questions,
            structured scoring, and a detailed final report—so you know what to
            improve before your next onsite.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/register" />}>
              Get started
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
          Three steps from setup to a personalized report you can revisit
          anytime.
        </p>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full border-border/80 shadow-sm">
                <CardHeader>
                  <p className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">
            Why InterviewAI
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Card className="h-full border-border/80 bg-background shadow-sm">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to practice?
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Create a free account to save sessions, track scores over time, and
          open detailed reports after every interview.
        </p>
        <Button size="lg" render={<Link href="/register" />}>
          Start practicing
        </Button>
      </section>
    </main>
  );
}