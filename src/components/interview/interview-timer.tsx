"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type InterviewTimerProps = {
  initialSeconds: number;
  onExpired?: () => void;
  className?: string;
};

export function InterviewTimer({ initialSeconds, onExpired, className }: InterviewTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (initialSeconds <= 0) {
      setSeconds(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          onExpiredRef.current?.();
          return 0;
        }
        return current - 1;
      });
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [initialSeconds]);

  const urgent = seconds > 0 && seconds <= 60;
  const low = seconds > 0 && seconds <= 180 && !urgent;

  return (
    <div
      className={cn(
        "inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-4 py-1.5 font-mono text-base font-semibold tabular-nums",
        urgent
          ? "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
          : low
            ? "bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200"
            : "bg-primary/8 text-foreground ring-1 ring-border/60",
        className,
      )}
      aria-live="polite"
    >
      {seconds <= 0 ? "0:00" : formatTime(seconds)}
    </div>
  );
}