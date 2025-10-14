import { useCallback } from 'react';

export function useSpeech() {
  const canWebSpeech =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string) => {
      if (!text?.trim()) return;

      if (canWebSpeech) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find((v) =>
            /en-(US|GB)/i.test(v.lang)
          );
          if (preferredVoice) utterance.voice = preferredVoice;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.warn('Speech synthesis failed:', error);
        }
        return;
      }

      // TODO: Fallback to Tauri Shell or local audio
      console.warn('Speech synthesis not available');
    },
    [canWebSpeech]
  );

  return { speak, canWebSpeech };
}
