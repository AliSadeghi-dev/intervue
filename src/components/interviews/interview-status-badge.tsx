import { Badge } from "@/components/ui/badge";
import { formatSessionStatus } from "@/lib/interview/labels";
import type { SessionStatus } from "@/lib/interview/constants";

const variantByStatus: Record<
  SessionStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  in_progress: "default",
  completed: "secondary",
  abandoned: "destructive",
};

export function InterviewStatusBadge({ status }: { status: string }) {
  const key = status as SessionStatus;
  const variant = variantByStatus[key] ?? "outline";

  return <Badge variant={variant}>{formatSessionStatus(status)}</Badge>;
}