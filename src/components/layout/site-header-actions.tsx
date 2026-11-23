import { signOutAction } from "@/features/authentication/actions";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

type SiteHeaderActionsProps = {
  userName: string;
};

export function SiteHeaderActions({ userName }: SiteHeaderActionsProps) {
  return (
  <>
    <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:inline">
      {userName}
    </span>
    <ButtonLink href="/dashboard" variant="ghost" size="sm">
      Dashboard
    </ButtonLink>
    <ButtonLink href="/interviews" variant="ghost" size="sm">
      History
    </ButtonLink>
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="sm">
        Sign out
      </Button>
    </form>
  </>
  );
}