import { useCallback } from 'react';

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export function useSpeech() {
  const canWebSpeech =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;

      // Strategy 1: Web Speech API (preferred)
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
          return;
        } catch (error) {
          console.warn('Web Speech API failed:', error);
        }
      }

      // Strategy 2: Tauri command (macOS say command)
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const result = await invoke<string>('speak_text', { text });
          console.log(result);
          return;
        } catch (error) {
          console.warn('Tauri speech command failed:', error);
        }
      }

      // Strategy 3: Fallback message
      console.warn('Speech synthesis not available on this platform');
    },
    [canWebSpeech]
  );

  return { speak, canWebSpeech, isTauri };
}
