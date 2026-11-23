"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type InterviewTimerProps = {
  initialSeconds: number;
  onExpired?: () => void;
};

export function InterviewTimer({ initialSeconds, onExpired }: InterviewTimerProps) {
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

  return (
    <p
      className={`font-mono text-lg font-semibold tabular-nums ${urgent ? "text-destructive" : "text-foreground"}`}
      aria-live="polite"
    >
      {seconds <= 0 ? "Time is up" : formatTime(seconds)}
    </p>
  );
}