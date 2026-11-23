import Link from "next/link";
import { connection } from "next/server";

import { auth } from "@/auth";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { ButtonLink } from "@/components/ui/button-link";

export async function SiteHeader() {
  await connection();
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="font-heading text-lg font-bold tracking-tight text-foreground"
        >
          InterviewAI
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <SiteHeaderActions
              userName={session.user.name ?? session.user.email ?? "Account"}
            />
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}