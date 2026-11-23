"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type RegenerateReportButtonProps = {
  sessionId: string;
};

export function RegenerateReportButton({ sessionId }: RegenerateReportButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegenerate() {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`/api/interviews/${sessionId}/report/regenerate`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error ?? "Could not regenerate the report.");
      setIsLoading(false);
      return;
    }

    router.refresh();
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleRegenerate()}
        disabled={isLoading}
      >
        {isLoading ? "Regenerating…" : "Regenerate report"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}