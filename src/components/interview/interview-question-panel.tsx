"use client";

import { Volume2, VolumeX } from "lucide-react";

import { HighlightedQuestionText } from "@/components/interview/highlighted-question-text";
import { Button } from "@/components/ui/button";
import { useQuestionSpeech } from "@/hooks/use-question-speech";
import { cn } from "cn";

type InterviewQuestionPanelProps = {
  questionText: string;
  autoRead?: boolean;
};

function SpeakingBars() {
  return (
    <div className="flex h-4 items-end gap-0.5" aria-hidden>
      {[35, 55, 40, 65, 38].map((height, index) => (
        <span
          key={index}
          className="w-0.5 animate-pulse rounded-full bg-primary/80"
          style={{
            height: `${height}%`,
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

export function InterviewQuestionPanel({
  questionText,
  autoRead = true,
}: InterviewQuestionPanelProps) {
  const speech = useQuestionSpeech({ text: questionText, autoRead });

  return (
    <>
      {speech.supported ? (
        <div
          className={cn(
            "mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground",
            speech.isSpeaking && "text-foreground",
          )}
        >
          <div className="flex items-center gap-2">
            {speech.isSpeaking ? <SpeakingBars /> : <Volume2 className="size-3.5 opacity-70" />}
            <span>{speech.isSpeaking ? "Reading question…" : "Question audio"}</span>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2.5 text-xs"
              onClick={speech.speak}
            >
              Replay
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2.5 text-xs"
              onClick={speech.stop}
            >
              <VolumeX className="size-3.5" />
              Stop
            </Button>
          </div>
        </div>
      ) : null}

      <HighlightedQuestionText
        tokens={speech.tokens}
        activeWordIndex={speech.activeWordIndex}
        isSpeaking={speech.isSpeaking}
        className="mt-4"
      />
    </>
  );
}