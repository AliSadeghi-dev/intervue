"use client";

import { cn } from "cn";

type RecordingLevelBarsProps = {
  levels: number[];
  active?: boolean;
  className?: string;
};

export function RecordingLevelBars({
  levels,
  active = true,
  className,
}: RecordingLevelBarsProps) {
  const bars = levels.length > 0 ? levels : [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15];

  return (
    <div
      className={cn("flex h-10 items-end justify-center gap-1", className)}
      aria-hidden
    >
      {bars.map((level, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full bg-foreground/50 transition-[height] duration-100",
            !active && "bg-muted-foreground/30",
          )}
          style={{
            height: `${Math.max(12, Math.min(100, level * 100))}%`,
          }}
        />
      ))}
    </div>
  );
}