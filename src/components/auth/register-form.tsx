"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setFormError(payload?.error ?? "Could not create account. Try again.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
      router.refresh();
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const { register, handleSubmit, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field data-invalid={!!formState.errors.name}>
        <FieldLabel htmlFor="name">Full name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!formState.errors.name}
            {...register("name")}
          />
          <FieldError errors={[formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!formState.errors.email}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!formState.errors.email}
            {...register("email")}
          />
          <FieldError errors={[formState.errors.email]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!formState.errors.password}>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <FieldContent>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!formState.errors.password}
            {...register("password")}
          />
          <FieldError errors={[formState.errors.password]} />
        </FieldContent>
      </Field>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
