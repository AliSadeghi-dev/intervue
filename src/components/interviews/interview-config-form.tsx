"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_LEVELS, INTERVIEW_DURATIONS, JOB_ROLES } from "@/lib/interview/constants";
import { formatExperienceLevel, formatJobRole } from "@/lib/interview/labels";
import {
  createInterviewSessionSchema,
  type CreateInterviewSessionInput,
} from "@/lib/validations/interview";

export function InterviewConfigForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateInterviewSessionInput>({
    resolver: zodResolver(createInterviewSessionSchema),
    defaultValues: {
      jobRole: "frontend",
      experienceLevel: "junior",
      duration: 15,
    },
  });

  async function onSubmit(values: CreateInterviewSessionInput) {
    setFormError(null);

    const response = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as {
      interview?: { id: string };
      error?: string;
    } | null;

    if (!response.ok || !payload?.interview?.id) {
      setFormError(payload?.error ?? "Could not create the interview session.");
      return;
    }

    router.push(`/interview/${payload.interview.id}`);
    router.refresh();
  }

  const { handleSubmit, control, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Field>
        <FieldLabel>Job role</FieldLabel>
        <FieldContent>
          <Controller
            name="jobRole"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatJobRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[formState.errors.jobRole]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Experience level</FieldLabel>
        <FieldContent>
          <Controller
            name="experienceLevel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {formatExperienceLevel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[formState.errors.experienceLevel]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Duration</FieldLabel>
        <FieldContent>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_DURATIONS.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[formState.errors.duration]} />
        </FieldContent>
      </Field>

      <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        In the workspace you can <span className="font-medium text-foreground">type</span> or{" "}
        <span className="font-medium text-foreground">record</span> each answer — no mode to pick here.
      </p>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Creating session…" : "Continue to workspace"}
      </Button>
    </form>
  );
}