"use client";

import type { QuestionToken } from "@/hooks/use-question-speech";
import { cn } from "cn";

type HighlightedQuestionTextProps = {
  tokens: QuestionToken[];
  activeWordIndex: number | null;
  isSpeaking: boolean;
  className?: string;
};

export function HighlightedQuestionText({
  tokens,
  activeWordIndex,
  isSpeaking,
  className,
}: HighlightedQuestionTextProps) {
  if (tokens.length === 0) {
    return null;
  }

  return (
    <p
      className={cn(
        "whitespace-pre-wrap text-lg leading-[1.75] tracking-tight md:text-xl",
        isSpeaking ? "text-muted-foreground" : "text-foreground",
        className,
      )}
    >
      {tokens.map((token, index) => {
        if (!token.isWord) {
          return <span key={`space-${index}`}>{token.text}</span>;
        }

        const isActive =
          isSpeaking && activeWordIndex != null && token.wordIndex === activeWordIndex;

        return (
          <span
            key={`word-${index}-${token.start}`}
            className={cn(
              "transition-[color,font-weight] duration-300 ease-out",
              isActive && "font-medium text-foreground decoration-primary/70 underline decoration-2 underline-offset-[0.25em]",
              !isSpeaking && "text-foreground",
            )}
          >
            {token.text}
          </span>
        );
      })}
    </p>
  );
}