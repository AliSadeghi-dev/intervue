"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  findWordIndexAtChar,
  tokenizeQuestion,
  type QuestionToken,
} from "@/lib/speech/question-text";
import {
  isSpeechSynthesisSupported,
  pickEnglishVoice,
  stopSpeech,
} from "@/lib/speech/speech-synthesis";

export type { QuestionToken };
export { tokenizeQuestion };

type UseQuestionSpeechOptions = {
  text: string | null;
  autoRead?: boolean;
};

export function useQuestionSpeech({ text, autoRead = true }: UseQuestionSpeechOptions) {
  const [supported, setSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const syncTickerRef = useRef<number | null>(null);
  const tickerIndexRef = useRef(0);
  const anchorBoundaryRef = useRef(0);
  const tokens = useMemo(() => (text ? tokenizeQuestion(text) : []), [text]);
  const wordCount = tokens.filter((t) => t.isWord).length;

  const clearSyncTicker = useCallback(() => {
    if (syncTickerRef.current) {
      window.clearInterval(syncTickerRef.current);
      syncTickerRef.current = null;
    }
  }, []);

  const resetHighlight = useCallback(() => {
    setActiveWordIndex(null);
    tickerIndexRef.current = 0;
    anchorBoundaryRef.current = 0;
    clearSyncTicker();
  }, [clearSyncTicker]);

  /** ~150 wpm at rate 1 — ticker only fills gaps between boundary events */
  const msPerWord = useCallback((rate: number) => Math.max(280, 400 / rate), []);

  const setHighlightIndex = useCallback((index: number, maxWords: number) => {
    const clamped = Math.max(0, Math.min(maxWords - 1, index));
    tickerIndexRef.current = clamped;
    setActiveWordIndex(clamped);
  }, []);

  const startSyncTicker = useCallback(
    (fromIndex: number, rate: number, maxWords: number) => {
      clearSyncTicker();
      if (maxWords === 0) {
        return;
      }
      setHighlightIndex(fromIndex, maxWords);

      syncTickerRef.current = window.setInterval(() => {
        const next = tickerIndexRef.current + 1;
        const maxAllowed = Math.min(maxWords - 1, anchorBoundaryRef.current + 1);
        if (next > maxAllowed || next >= maxWords) {
          return;
        }
        setHighlightIndex(next, maxWords);
      }, msPerWord(rate));
    },
    [clearSyncTicker, msPerWord, setHighlightIndex],
  );

  const runSpeak = useCallback(
    (content: string, speechTokens: QuestionToken[]) => {
      if (!isSpeechSynthesisSupported()) {
        return;
      }

      stopSpeech();
      resetHighlight();

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "en-US";
      const voice = pickEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }
      const rate = 1;
      utterance.rate = rate;
      const words = speechTokens.filter((t) => t.isWord).length;
      anchorBoundaryRef.current = 0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        startSyncTicker(0, rate, words);
      };

      utterance.onboundary = (event) => {
        if (event.name !== "word") {
          return;
        }
        const idx = Math.min(words - 1, findWordIndexAtChar(speechTokens, event.charIndex));
        anchorBoundaryRef.current = idx;
        setHighlightIndex(idx, words);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resetHighlight();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resetHighlight();
      };

      window.speechSynthesis.speak(utterance);
    },
    [resetHighlight, startSyncTicker],
  );

  const speak = useCallback(() => {
    if (!text) {
      return;
    }
    runSpeak(text, tokens);
  }, [runSpeak, text, tokens]);

  const stop = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    resetHighlight();
  }, [resetHighlight]);

  useEffect(() => {
    setSupported(isSpeechSynthesisSupported());
  }, []);

  useEffect(() => {
    if (!supported || !autoRead || !text) {
      return;
    }
    runSpeak(text, tokens);
    return () => {
      stopSpeech();
      setIsSpeaking(false);
      clearSyncTicker();
      setActiveWordIndex(null);
      tickerIndexRef.current = 0;
      anchorBoundaryRef.current = 0;
    };
  }, [autoRead, clearSyncTicker, runSpeak, supported, text, tokens]);

  return {
    supported,
    isSpeaking,
    activeWordIndex,
    tokens,
    speak,
    stop,
  };
}