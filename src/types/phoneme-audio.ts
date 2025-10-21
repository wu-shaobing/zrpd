/**
 * 音素音频系统类型定义
 * 支持三层语音架构：本地sprite → 系统TTS → Web Speech API
 */

// 音频Sprite区域（毫秒）
export interface AudioRegion {
  start: number;  // 起始时间（ms）
  end: number;    // 结束时间（ms）
}

// 载体音节（用于TTS兜底）
export interface CarrierSyllable {
  initial?: string;  // 词首位置：/θ/ → "th-uh"
  medial?: string;   // 词中位置：/θ/ → "uh-th-uh"
  final?: string;    // 词尾位置：/θ/ → "uh-th"
  isolated?: string; // 单独发音（默认）
}

// 音素音频配置
export interface PhonemeAudioConfig {
  id: string;                    // 音素ID（对应phonics-complete.json）
  symbol: string;                // IPA符号
  graphemes: string[];           // 字母/字母组合
  category: 'vowel' | 'consonant' | 'diphthong';
  
  // 音频Sprite信息
  spriteKey: string;             // sprite文件名（如"phonemes-vowels"）
  region: AudioRegion;           // 在sprite中的时间区域
  
  // TTS兜底配置
  carrier: CarrierSyllable;      // 载体音节
  ttsRate?: number;              // TTS语速（默认0.9）
  ttsPitch?: number;             // TTS音高（默认1.0）
  
  // 元数据
  ariaLabel: string;             // 无障碍描述
  duration: number;              // 音频时长（ms）
  sampleText?: string;           // 示例文本（用于测试）
}

// Sprite清单（由audiosprite生成）
export interface AudioSpriteManifest {
  resources: string[];           // 音频文件路径列表
  spritemap: {
    [key: string]: {             // 音素ID
      start: number;
      end: number;
      loop: boolean;
    };
  };
}

// 播放策略
export type PlaybackStrategy = 'sprite' | 'tauri-tts' | 'web-speech' | 'none';

// 播放选项
export interface PhonemePlayOptions {
  position?: 'initial' | 'medial' | 'final' | 'isolated'; // 音素位置
  forceStrategy?: PlaybackStrategy;                        // 强制使用某策略
  volume?: number;                                         // 音量 0-1
  onStart?: () => void;                                    // 开始回调
  onEnd?: () => void;                                      // 结束回调
  onError?: (error: Error) => void;                        // 错误回调
}

// 播放结果
export interface PhonemePlayResult {
  success: boolean;
  strategy: PlaybackStrategy;
  duration: number;  // 实际播放时长
  error?: string;
}
