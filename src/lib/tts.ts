/**
 * 统一 TTS API（支持 Tauri tts-rs + Piper + Web Speech 回退）
 */

// 检查 Tauri 环境
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export type TtsEngine = 'auto' | 'piper' | 'system' | 'sprite' | 'web';

export interface SpeakOptions {
  lang?: 'zh-CN' | 'en-US' | string;
  voiceId?: string;
  rate?: number; // 0.5–2.0
  pitch?: number; // 0.5–2.0
  engine?: TtsEngine;
}

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  engine: 'piper' | 'system';
  gender?: string;
}

export interface Capability {
  system: { ok: boolean; langs: string[] };
  piper: { ok: boolean; langs: string[] };
}

/**
 * 列出所有可用语音（系统 + Piper）
 */
export async function listVoices(): Promise<VoiceInfo[]> {
  if (!isTauri) {
    console.warn('listVoices: not in Tauri environment');
    return [];
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const voices = await invoke<Array<{ id: string; name: string; lang: string; gender?: string }>>(
      'tts_list_voices'
    );
    return voices.map((v) => ({ ...v, engine: 'system' as const }));
  } catch (error) {
    console.error('Failed to list voices:', error);
    return [];
  }
}

/**
 * 获取系统 TTS 能力
 */
export async function capability(): Promise<Capability> {
  const defaultCap: Capability = {
    system: { ok: false, langs: [] },
    piper: { ok: false, langs: [] },
  };

  if (!isTauri) {
    return defaultCap;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const cap = await invoke<{ ok: boolean; langs: string[] }>('tts_capability');
    return {
      system: cap,
      piper: { ok: false, langs: [] }, // P2 集成 Piper 后扩展
    };
  } catch (error) {
    console.error('Failed to get capability:', error);
    return defaultCap;
  }
}

/**
 * 播放文本语音（自动选择引擎）
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<boolean> {
  const { lang, voiceId, rate, pitch, engine = 'auto' } = options;

  // 优先 Tauri 系统 TTS
  if (isTauri && (engine === 'auto' || engine === 'system')) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('tts_speak_system', {
        text,
        lang,
        voice: voiceId,
        rate,
        pitch,
      });
      return true;
    } catch (error) {
      console.warn('Tauri TTS failed, fallback to Web Speech:', error);
    }
  }

  // 回退到 Web Speech API（开发/浏览器环境）
  if (engine === 'auto' || engine === 'web') {
    return await speakWithWebSpeech(text, { lang, rate, pitch });
  }

  return false;
}

/**
 * Web Speech API 回退
 */
async function speakWithWebSpeech(
  text: string,
  options: { lang?: string; rate?: number; pitch?: number }
): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}
