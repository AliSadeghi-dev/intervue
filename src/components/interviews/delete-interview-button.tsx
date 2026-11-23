"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type DeleteInterviewButtonProps = {
  sessionId: string;
};

export function DeleteInterviewButton({ sessionId }: DeleteInterviewButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this interview session?")) {
      return;
    }

    setIsLoading(true);
    await fetch(`/api/interviews/${sessionId}`, { method: "DELETE" });
    router.refresh();
    setIsLoading(false);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={isLoading}
      onClick={handleDelete}
    >
      {isLoading ? "Deleting…" : "Delete"}
    </Button>
  );
}