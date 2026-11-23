"use client";

import { Loader2, Square } from "lucide-react";

import { RecordingLevelBars } from "@/components/interview/recording-level-bars";
import { Button } from "@/components/ui/button";
import type { VoiceRecorderPhase } from "@/hooks/use-voice-recorder";
import { cn } from "cn";

type VoiceRecordingBarProps = {
  phase: VoiceRecorderPhase;
  seconds: number;
  levels: number[];
  error: string | null;
  onFinish: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecordingBar({
  phase,
  seconds,
  levels,
  error,
  onFinish,
  onCancel,
  disabled = false,
}: VoiceRecordingBarProps) {
  if (phase === "idle" && !error) {
    return null;
  }

  if (phase === "transcribing") {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/25 px-4 py-3 text-sm text-muted-foreground"
        role="status"
      >
        <Loader2 className="size-4 shrink-0 animate-spin" />
        Transcribing… text will appear in the box below
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        )}
        role="region"
        aria-label="Recording in progress"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative flex size-2.5 shrink-0" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-foreground" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Listening…</p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatTime(seconds)}</p>
          </div>
          <RecordingLevelBars levels={levels} className="h-7 max-w-[140px] flex-1" />
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 rounded-full px-4"
            onClick={onFinish}
            disabled={disabled}
          >
            <Square className="size-3 fill-current" aria-hidden />
            Done speaking
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return null;
}