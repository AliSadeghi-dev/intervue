"use client";

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (english.length === 0) {
    return null;
  }

  return (
    english.find((voice) => voice.name.toLowerCase().includes("google")) ??
    english.find((voice) => voice.localService) ??
    english[0]
  );
}

export function speakEnglishText(text: string): void {
  if (!isSpeechSynthesisSupported()) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  const voice = pickEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (!isSpeechSynthesisSupported()) {
    return;
  }
  window.speechSynthesis.cancel();
}