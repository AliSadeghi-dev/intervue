"use client";

import { Mic, Send } from "lucide-react";

import { VoiceRecordingBar } from "@/components/interview/voice-recording-bar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { cn } from "cn";
import { MAX_ANSWER_LENGTH } from "@/lib/validations/answer";

type InterviewAnswerComposerProps = {
  sessionId: string;
  questionId: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  speechEnabled: boolean;
};

export function InterviewAnswerComposer({
  sessionId,
  questionId,
  answer,
  onAnswerChange,
  onSubmit,
  isSubmitting,
  speechEnabled,
}: InterviewAnswerComposerProps) {
  function appendTranscript(transcript: string) {
    const next = answer.trim() ? `${answer.trim()}\n\n${transcript}` : transcript;
    onAnswerChange(next.slice(0, MAX_ANSWER_LENGTH));
  }

  const voice = useVoiceRecorder({
    sessionId,
    questionId,
    onTranscript: appendTranscript,
  });

  const voiceError = voice.micError ?? voice.transcribeError;
  const recordingUi = voice.isRecording || voice.isTranscribing;

  return (
    <section className="rounded-2xl border border-border/60 bg-card">
      <header className="border-b border-border/50 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Your answer</h2>
        <p className="text-xs text-muted-foreground">
          Type here, or record — when you&apos;re finished speaking, press{" "}
          <span className="font-medium text-foreground">Done speaking</span>.
        </p>
      </header>

      <div className="space-y-3 p-5">
        {speechEnabled ? (
          <VoiceRecordingBar
            phase={voice.phase}
            seconds={voice.seconds}
            levels={voice.levels}
            error={recordingUi ? null : voiceError}
            onFinish={voice.finish}
            onCancel={voice.cancel}
            disabled={isSubmitting}
          />
        ) : null}

        {speechEnabled && recordingUi && voiceError ? (
          <p className="text-xs text-destructive" role="alert">
            {voiceError}
          </p>
        ) : null}

        <Textarea
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder={
            speechEnabled
              ? "Type your answer in English…"
              : "Write your answer in English…"
          }
          rows={7}
          maxLength={MAX_ANSWER_LENGTH}
          disabled={isSubmitting || voice.isTranscribing}
          aria-label="Answer"
          className={cn(
            "min-h-[140px] resize-y rounded-xl border-border/50 bg-background text-[15px] leading-relaxed",
            voice.isRecording && "border-foreground/15",
          )}
        />

        <footer className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-muted-foreground tabular-nums">
            {answer.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {speechEnabled && !recordingUi ? (
              <Button
                type="button"
                variant="secondary"
                className="gap-2 rounded-full"
                onClick={() => void voice.start()}
                disabled={isSubmitting}
              >
                <Mic className="size-4" />
                Record answer
              </Button>
            ) : null}

            <Button
              type="button"
              className="gap-2 rounded-full px-5"
              onClick={onSubmit}
              disabled={isSubmitting || answer.trim().length === 0 || voice.isTranscribing || voice.isRecording}
            >
              <Send className="size-4" />
              {isSubmitting ? "Submitting…" : "Submit answer"}
            </Button>
          </div>
        </footer>

        {!speechEnabled ? (
          <p className="text-center text-xs text-muted-foreground">
            Voice needs <code className="text-[10px]">ASSEMBLYAI_API_KEY</code> on the server.
          </p>
        ) : null}
      </div>
    </section>
  );
}