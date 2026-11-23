import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Log in",
};

export const instant = false;

export default async function LoginPage() {
  await connection();
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Use Google or your email and password to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading form…</p>
            }
          >
            <GoogleSignInButton />
          </Suspense>
          <AuthDivider />
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading form…</p>
            }
          >
            <LoginForm />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}