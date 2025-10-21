# 前端 TTS API 设计

统一封装前端调用，透明切换 Piper/系统 TTS/音频 sprite，保证中英文可用性。

## 类型定义（TS）

```ts
export type TtsEngine = 'auto' | 'piper' | 'system' | 'sprite' | 'web';

export interface SpeakOptions {
  lang?: 'zh-CN' | 'en-US';
  voiceId?: string; // Piper 或系统声音名
  rate?: number;    // 0.5–2.0
  pitch?: number;   // 0.5–2.0
  engine?: TtsEngine;
}

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;        // zh-CN / en-US
  engine: 'piper' | 'system';
}

export interface Capability { system: { ok: boolean; langs: string[] }; piper: { ok: boolean; langs: string[] } }
```

## API（src/lib/tts.ts）

- listVoices(): Promise<VoiceInfo[]>
- capability(): Promise<Capability>
- speak(text: string, options?: SpeakOptions): Promise<boolean>

调度策略（engine='auto'）：
- 若 options.lang 为 'en-US' 且 Piper 可用 → 优先 Piper
- 若 options.lang 为 'zh-CN' 且 Piper 中文可用 → Piper；否则 system
- 若两者都不可用 → web（开发）或返回 false

## 与现有音频系统的衔接

- 音素播报：保持 `PhonemeAudioAdapter` 现有首选 sprite 策略。
- 一般文本：改用本 API，调用 Tauri commands；失败时可回退到 Web Speech（开发时）。

## 示例

```ts
import { speak, listVoices } from '@/lib/tts';

await speak('Hello', { lang: 'en-US' });
await speak('你好', { lang: 'zh-CN', engine: 'system' });
```
