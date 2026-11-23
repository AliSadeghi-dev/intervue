import {
  ArrowRight,
  BarChart3,
  GitBranch,
  Mic,
  Settings2,
  Sparkles,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    icon: Settings2,
    label: "Step 1",
    title: "Configure your session",
    description:
      "Pick the stack you are interviewing for and how long you want to practice.",
    highlights: [
      "Role: frontend, backend, or full-stack",
      "Level from junior to senior",
      "Text or voice mode",
    ],
  },
  {
    icon: Sparkles,
    label: "Step 2",
    title: "Interview with adaptive AI",
    description:
      "Answer one question at a time while the AI listens, scores, and chooses what to ask next.",
    highlights: [
      "Follow-ups based on your answers",
      "Technical and communication scoring",
      "Timed session like a real loop",
    ],
  },
  {
    icon: BarChart3,
    label: "Step 3",
    title: "Study your report",
    description:
      "End with a breakdown you can reopen anytime—scores, gaps, and what to rehearse next.",
    highlights: [
      "Per-question review",
      "Strengths and weak areas",
      "Concrete improvement tips",
    ],
  },
] as const;

const benefits = [
  {
    icon: GitBranch,
    title: "Interviews that branch with you",
    description:
      "Strong answers unlock harder follow-ups. Gaps get clarifying questions instead of a fixed question bank.",
  },
  {
    icon: BarChart3,
    title: "Scores that separate skill from delivery",
    description:
      "Technical accuracy and depth are scored separately from clarity and structure—so you know what to fix.",
  },
  {
    icon: Mic,
    title: "Practice how you will perform",
    description:
      "Use text for precision or voice for pacing and verbal explanations—with transcription before evaluation.",
  },
  {
    icon: Sparkles,
    title: "Feedback you can act on",
    description:
      "Every session ends with a report tied to your actual answers—not generic interview advice.",
  },
] as const;

function StepCard({
  step,
}: {
  step: (typeof steps)[number];
}) {
  const Icon = step.icon;

  return (
    <Card className="h-full border-border/70 bg-background shadow-none ring-1 ring-foreground/8">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {step.label}
          </span>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/40">
            <Icon className="size-4 text-foreground" aria-hidden />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold leading-snug">
            {step.title}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-muted-foreground">
            {step.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 border-t border-border/60 pt-4">
          {step.highlights.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border/60 bg-linear-to-b from-muted/40 to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            AI-powered interview practice
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
            Sharpen your technical interviews before the real hiring loop
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            InterviewAI simulates a technical interview with adaptive questions,
            structured scoring, and a detailed final report—so you know what to
            improve before your next onsite.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Get started
            </ButtonLink>
            <ButtonLink href="/login" variant="outline" size="lg">
              Log in
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The workflow
          </p>
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">How it works</h2>
          <p className="text-pretty text-muted-foreground leading-relaxed">
            One focused flow from setup to report—no question banks to browse,
            no scripts to memorize. You show up, answer, and learn.
          </p>
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-2 pb-8 md:flex">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <span className="max-w-[11rem] text-center text-sm font-medium text-foreground">
                {step.title}
              </span>
              {index < steps.length - 1 ? (
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground/50"
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>

        <ol className="grid list-none gap-6 md:grid-cols-3 md:gap-5">
          {steps.map((step) => (
            <li key={step.label}>
              <StepCard step={step} />
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border/60 bg-muted/25">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Why us
              </p>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                Why InterviewAI
              </h2>
              <p className="text-pretty text-muted-foreground leading-relaxed">
                Built to mirror how hiring loops actually feel: one question
                leads to the next, time is limited, and feedback should reflect
                what you said—not a template.
              </p>
              <p className="mt-4 text-pretty text-sm text-muted-foreground leading-relaxed">
                Practice privately, repeat as often as you need, and compare
                reports as your explanations improve.
              </p>
            </div>

            <ul className="grid list-none gap-4 sm:grid-cols-2 lg:col-span-8">
              {benefits.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <div className="flex h-full flex-col rounded-xl border border-border/70 bg-background p-5 ring-1 ring-foreground/5 transition-colors hover:bg-muted/15">
                    <div className="mb-4 flex size-9 items-center justify-center rounded-lg border border-border/80 bg-muted/30">
                      <Icon className="size-4 text-foreground" aria-hidden />
                    </div>
                    <h3 className="mb-2 font-heading text-base font-bold leading-snug">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="text-2xl font-bold">Ready to practice?</h2>
        <p className="max-w-lg text-muted-foreground">
          Create a free account to save sessions, track scores over time, and
          open detailed reports after every interview.
        </p>
        <ButtonLink href="/register" size="lg">
          Start practicing
        </ButtonLink>
      </section>
    </main>
  );
}