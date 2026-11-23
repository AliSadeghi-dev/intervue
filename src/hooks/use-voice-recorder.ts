"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MAX_VOICE_ANSWER_SECONDS } from "@/lib/speech/constants";

export type VoiceRecorderPhase = "idle" | "recording" | "transcribing";

type UseVoiceRecorderOptions = {
  sessionId: string;
  questionId: string;
  onTranscript: (text: string) => void;
};

export function useVoiceRecorder({
  sessionId,
  questionId,
  onTranscript,
}: UseVoiceRecorderOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const phaseRef = useRef<VoiceRecorderPhase>("idle");
  const discardOnStopRef = useRef(false);

  const [phase, setPhase] = useState<VoiceRecorderPhase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const setPhaseSafe = useCallback((next: VoiceRecorderPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const teardownAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const pollLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) {
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const slice = 7;
    const step = Math.floor(data.length / slice) || 1;
    const next: number[] = [];
    for (let i = 0; i < slice; i++) {
      const value = data[i * step] ?? 0;
      next.push(value / 255);
    }
    setLevels(next);
    rafRef.current = requestAnimationFrame(pollLevels);
  }, []);

  const upload = useCallback(
    async (mimeType: string) => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size === 0) {
        setTranscribeError("No audio captured. Try again.");
        setPhaseSafe("idle");
        return;
      }

      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("questionId", questionId);
      formData.append("audio", blob, "answer.webm");

      try {
        const response = await fetch("/api/speech/transcribe", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          transcript?: string;
        } | null;

        if (!response.ok) {
          setTranscribeError(payload?.error ?? "Transcription failed.");
          setPhaseSafe("idle");
          return;
        }

        const transcript = payload?.transcript?.trim() ?? "";
        if (!transcript) {
          setTranscribeError("No speech detected.");
          setPhaseSafe("idle");
          return;
        }

        onTranscript(transcript);
        setPhaseSafe("idle");
      } catch {
        setTranscribeError("Network error while transcribing.");
        setPhaseSafe("idle");
      }
    },
    [onTranscript, questionId, sessionId, setPhaseSafe],
  );

  const finishRecording = useCallback(() => {
    if (stopTimerRef.current) {
      window.clearInterval(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    if (phaseRef.current === "recording") {
      setPhaseSafe("transcribing");
    }
  }, [setPhaseSafe]);

  const start = useCallback(async () => {
    setMicError(null);
    setTranscribeError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;
      rafRef.current = requestAnimationFrame(pollLevels);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        teardownAudio();
        if (discardOnStopRef.current) {
          discardOnStopRef.current = false;
          chunksRef.current = [];
          setPhaseSafe("idle");
          return;
        }
        void upload(mimeType);
      };

      mediaRecorderRef.current = recorder;
      setSeconds(0);
      setPhaseSafe("recording");
      recorder.start(250);

      stopTimerRef.current = window.setInterval(() => {
        setSeconds((current) => {
          if (current + 1 >= MAX_VOICE_ANSWER_SECONDS) {
            finishRecording();
            return MAX_VOICE_ANSWER_SECONDS;
          }
          return current + 1;
        });
      }, 1_000);
    } catch {
      teardownAudio();
      setMicError("Allow microphone access to record your answer.");
    }
  }, [finishRecording, pollLevels, setPhaseSafe, teardownAudio, upload]);

  const cancelRecording = useCallback(() => {
    if (phaseRef.current !== "recording") {
      return;
    }
    if (stopTimerRef.current) {
      window.clearInterval(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    discardOnStopRef.current = true;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      discardOnStopRef.current = false;
      teardownAudio();
      setPhaseSafe("idle");
    }
  }, [setPhaseSafe, teardownAudio]);

  useEffect(() => {
    setPhaseSafe("idle");
    setSeconds(0);
    setLevels([]);
    setMicError(null);
    setTranscribeError(null);
    teardownAudio();
  }, [questionId, setPhaseSafe, teardownAudio]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) {
        window.clearInterval(stopTimerRef.current);
      }
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      teardownAudio();
    };
  }, [teardownAudio]);

  return {
    phase,
    seconds,
    levels,
    micError,
    transcribeError,
    start,
    finish: finishRecording,
    cancel: cancelRecording,
    isRecording: phase === "recording",
    isTranscribing: phase === "transcribing",
  };
}