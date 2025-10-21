/**
 * 音素音频播放适配器
 * 三层策略：本地Sprite → Tauri TTS → Web Speech API
 * 
 * @citations
 * - Web Speech API: https://developer.mozilla.org/docs/Web/API/SpeechSynthesis
 * - eSpeak NG: https://github.com/espeak-ng/espeak-ng
 * - Howler.js: https://github.com/goldfire/howler.js
 */

import type {
  PhonemeAudioConfig,
  PhonemePlayOptions,
  PhonemePlayResult,
  PlaybackStrategy,
} from '../types/phoneme-audio';

import phonemeAudioConfigData from '../data/phoneme-audio-config.json';

// 检查Tauri环境
const isTauri =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// 检查Web Speech API
const hasWebSpeech =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * 音频Sprite管理器
 * 使用Web Audio API播放sprite片段
 */
class AudioSpriteManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
  private spriteMaps: Map<string, { [key: string]: [number, number] }> = new Map();
  private spriteMapLoading: Map<string, Promise<void>> = new Map();

  async init() {
    if (this.audioContext) return;
    
    if (typeof window === 'undefined' || !('AudioContext' in window)) {
      console.warn('AudioContext not available');
      return;
    }

    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
    }
  }

  /**
   * 加载音频sprite文件
   */
  async loadSprite(spriteKey: string, url: string): Promise<AudioBuffer | null> {
    // 如果已加载，直接返回
    if (this.audioBuffers.has(spriteKey)) {
      return this.audioBuffers.get(spriteKey)!;
    }

    // 如果正在加载，返回相同的Promise
    if (this.loadingPromises.has(spriteKey)) {
      return this.loadingPromises.get(spriteKey)!;
    }

    // 开始新的加载
    const loadPromise = this._loadAudio(url);
    this.loadingPromises.set(spriteKey, loadPromise);

    try {
      const buffer = await loadPromise;
      this.audioBuffers.set(spriteKey, buffer);
      this.loadingPromises.delete(spriteKey);
      return buffer;
    } catch (error) {
      console.error(`Failed to load sprite ${spriteKey}:`, error);
      this.loadingPromises.delete(spriteKey);
      return null;
    }
  }

  private async _loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * 加载 audiosprite JSON 索引
   */
  async loadSpriteMap(spriteKey: string, url: string): Promise<void> {
    if (this.spriteMaps.has(spriteKey)) return;
    if (this.spriteMapLoading.has(spriteKey)) {
      await this.spriteMapLoading.get(spriteKey)!;
      return;
    }

    const loadPromise = (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load spritemap: ${url}`);
      const json = await res.json();
      // audiosprite 格式：{ sprite: { v1: [startMs, durationMs] } }
      if (!json || !json.sprite) throw new Error('Invalid audiosprite JSON');
      this.spriteMaps.set(spriteKey, json.sprite);
    })();

    this.spriteMapLoading.set(spriteKey, loadPromise);
    try {
      await loadPromise;
    } finally {
      this.spriteMapLoading.delete(spriteKey);
    }
  }

  /**
   * 查询 spritemap 片段（毫秒）
   * audiosprite 格式：[startMs, durationMs]
   */
  getRegionMs(spriteKey: string, entryKey: string): { startMs: number; endMs: number } | null {
    const map = this.spriteMaps.get(spriteKey);
    if (!map) return null;
    const entry = map[entryKey];
    if (!entry || !Array.isArray(entry) || entry.length < 2) return null;
    const [startMs, durationMs] = entry;
    return { startMs, endMs: startMs + durationMs };
  }

  /**
   * 播放sprite片段
   */
  async playRegion(
    spriteKey: string,
    startMs: number,
    endMs: number,
    options: { volume?: number; onEnd?: () => void } = {}
  ): Promise<boolean> {
    if (!this.audioContext) {
      await this.init();
      if (!this.audioContext) return false;
    }

    const buffer = this.audioBuffers.get(spriteKey);
    if (!buffer) {
      console.warn(`Sprite ${spriteKey} not loaded`);
      return false;
    }

    try {
      // Resume AudioContext if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // 创建增益节点控制音量
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume ?? 1.0;

      // 淡入淡出 (5ms)
      const fadeTime = 0.005;
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(
        options.volume ?? 1.0,
        now + fadeTime
      );

      const duration = (endMs - startMs) / 1000;
      gainNode.gain.setValueAtTime(
        options.volume ?? 1.0,
        now + duration - fadeTime
      );
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 播放指定片段
      source.start(0, startMs / 1000, duration);

      if (options.onEnd) {
        source.onended = options.onEnd;
      }

      return true;
    } catch (error) {
      console.error('Failed to play sprite region:', error);
      return false;
    }
  }
}

/**
 * Tauri TTS适配器（使用统一 tts_speak_system 命令）
 */
class TauriTTSAdapter {
  async speak(text: string, options: { rate?: number; pitch?: number } = {}): Promise<boolean> {
    if (!isTauri) return false;

    // 文本长度限制与清理
    const cleaned = (text || '').toString().slice(0, 200).replace(/[\r\n]+/g, ' ').trim();
    if (!cleaned) return false;

    try {
      // 调用新的 Tauri TTS 命令（tts-rs 后端）
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('tts_speak_system', {
        text: cleaned,
        lang: undefined, // 由后端自动选择
        voice: undefined,
        rate: options.rate ?? 0.9, // 直接传入 0.5-2.0 范围
        pitch: options.pitch ?? 1.0,
      });
      return true;
    } catch (error) {
      console.warn('Tauri TTS failed:', error);
      return false;
    }
  }
}

/**
 * Web Speech API适配器
 */
class WebSpeechAdapter {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (hasWebSpeech) {
      this.synthesis = window.speechSynthesis;
      this._loadVoices();
    }
  }

  private _loadVoices() {
    if (!this.synthesis) return;

    // 加载语音列表
    this.voices = this.synthesis.getVoices();

    // 某些浏览器异步加载
    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis!.getVoices();
      });
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number } = {}): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve(false);
        return;
      }

      // 取消之前的播放
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 选择英语语音
      const englishVoice = this.voices.find((v) => /en-(US|GB)/i.test(v.lang));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve(true);
      utterance.onerror = (error) => {
        console.warn('Web Speech error:', error);
        resolve(false);
      };

      try {
        this.synthesis.speak(utterance);
      } catch (error) {
        console.error('Web Speech speak failed:', error);
        resolve(false);
      }
    });
  }
}

/**
 * 音素音频播放适配器（主类）
 */
export class PhonemeAudioAdapter {
  private spriteManager: AudioSpriteManager;
  private tauriAdapter: TauriTTSAdapter;
  private webSpeechAdapter: WebSpeechAdapter;
  private phonemeConfigs: Map<string, PhonemeAudioConfig>;
  private initialized: boolean = false;

  constructor() {
    this.spriteManager = new AudioSpriteManager();
    this.tauriAdapter = new TauriTTSAdapter();
    this.webSpeechAdapter = new WebSpeechAdapter();
    this.phonemeConfigs = new Map();

    // 加载音素配置
    this._loadConfigs();
  }

  private _loadConfigs() {
    const configs = phonemeAudioConfigData.phonemes as PhonemeAudioConfig[];
    configs.forEach((config) => {
      this.phonemeConfigs.set(config.id, config);
    });
  }

  /**
   * 初始化音频系统
   */
  async init() {
    if (this.initialized) return;

    await this.spriteManager.init();

    // 预加载关键sprite（可选）
    // 在实际应用中，可以在用户交互后懒加载
    console.log('PhonemeAudioAdapter initialized');
    this.initialized = true;
  }

  /**
   * 预加载sprite文件
   */
  async preloadSprite(spriteKey: string): Promise<boolean> {
    // 构建sprite URL（根据实际部署路径调整）
    const audioUrl = `/assets/audio/${spriteKey}.mp3`;
    const jsonUrl = `/assets/audio/${spriteKey}.json`;
    
    try {
      // 并行加载音频与索引
      const [buffer] = await Promise.all([
        this.spriteManager.loadSprite(spriteKey, audioUrl),
        this.spriteManager.loadSpriteMap(spriteKey, jsonUrl),
      ]);
      return buffer !== null;
    } catch (error) {
      console.error(`Failed to preload sprite ${spriteKey}:`, error);
      return false;
    }
  }

  /**
   * 播放音素
   */
  async playPhoneme(
    phonemeId: string,
    options: PhonemePlayOptions = {}
  ): Promise<PhonemePlayResult> {
    const startTime = Date.now();
    const config = this.phonemeConfigs.get(phonemeId);

    if (!config) {
      return {
        success: false,
        strategy: 'none',
        duration: 0,
        error: `Phoneme ${phonemeId} not found`,
      };
    }

    // 触发开始回调
    options.onStart?.();

    // 策略1: 本地Sprite（首选）
    if (!options.forceStrategy || options.forceStrategy === 'sprite') {
      const spriteSuccess = await this._playFromSprite(config, options);
      if (spriteSuccess) {
        const duration = Date.now() - startTime;
        options.onEnd?.();
        return { success: true, strategy: 'sprite', duration };
      }
    }

    // 策略2: Tauri TTS（兜底1）
    if (!options.forceStrategy || options.forceStrategy === 'tauri-tts') {
      const tauriSuccess = await this._playFromTauri(config, options);
      if (tauriSuccess) {
        const duration = Date.now() - startTime;
        options.onEnd?.();
        return { success: true, strategy: 'tauri-tts', duration };
      }
    }

    // 策略3: Web Speech API（兜底2）
    if (!options.forceStrategy || options.forceStrategy === 'web-speech') {
      const webSpeechSuccess = await this._playFromWebSpeech(config, options);
      if (webSpeechSuccess) {
        const duration = Date.now() - startTime;
        options.onEnd?.();
        return { success: true, strategy: 'web-speech', duration };
      }
    }

    // 所有策略失败
    const duration = Date.now() - startTime;
    options.onError?.(new Error('All playback strategies failed'));
    return {
      success: false,
      strategy: 'none',
      duration,
      error: 'All playback strategies failed',
    };
  }

  /**
   * 策略1: 从sprite播放
   */
  private async _playFromSprite(
    config: PhonemeAudioConfig,
    options: PhonemePlayOptions
  ): Promise<boolean> {
    try {
      // 确保sprite与索引已加载
      const ok = await this.preloadSprite(config.spriteKey);
      if (!ok) return false;

      // 优先从 spritemap 获取时间（毫秒）
      const regionMs = this.spriteManager.getRegionMs(
        config.spriteKey,
        config.id
      );

      let startMs = config.region.start;
      let endMs = config.region.end;
      if (regionMs) {
        startMs = regionMs.startMs;
        endMs = regionMs.endMs;
      }

      if (endMs <= startMs) {
        console.warn(`Invalid region for ${config.id} in sprite ${config.spriteKey}`);
        return false;
      }

      return await this.spriteManager.playRegion(
        config.spriteKey,
        startMs,
        endMs,
        {
          volume: options.volume,
          onEnd: options.onEnd,
        }
      );
    } catch (error) {
      console.warn('Sprite playback failed:', error);
      return false;
    }
  }

  /**
   * 策略2: 使用Tauri TTS
   */
  private async _playFromTauri(
    config: PhonemeAudioConfig,
    options: PhonemePlayOptions
  ): Promise<boolean> {
    const position = options.position || 'isolated';
    const text = config.carrier[position] || config.carrier.isolated || config.sampleText || config.symbol;

    return await this.tauriAdapter.speak(text, {
      rate: config.ttsRate,
      pitch: config.ttsPitch,
    });
  }

  /**
   * 策略3: 使用Web Speech API
   */
  private async _playFromWebSpeech(
    config: PhonemeAudioConfig,
    options: PhonemePlayOptions
  ): Promise<boolean> {
    const position = options.position || 'isolated';
    const text = config.carrier[position] || config.carrier.isolated || config.sampleText || config.symbol;

    return await this.webSpeechAdapter.speak(text, {
      rate: config.ttsRate,
      pitch: config.ttsPitch,
    });
  }

  /**
   * 获取可用策略
   */
  getAvailableStrategies(): PlaybackStrategy[] {
    const strategies: PlaybackStrategy[] = [];
    
    // Sprite始终可尝试（可能失败但会fallback）
    strategies.push('sprite');
    
    if (isTauri) {
      strategies.push('tauri-tts');
    }
    
    if (hasWebSpeech) {
      strategies.push('web-speech');
    }
    
    return strategies;
  }

  /**
   * 批量预加载sprites（优化首次播放）
   */
  async preloadAll(): Promise<void> {
    const uniqueSpriteKeys = new Set<string>();
    this.phonemeConfigs.forEach((config) => {
      uniqueSpriteKeys.add(config.spriteKey);
    });

    const promises = Array.from(uniqueSpriteKeys).map((key) =>
      this.preloadSprite(key)
    );

    await Promise.allSettled(promises);
  }
}

// 单例实例
let adapterInstance: PhonemeAudioAdapter | null = null;

/**
 * 获取音素音频适配器单例
 */
export function getPhonemeAudioAdapter(): PhonemeAudioAdapter {
  if (!adapterInstance) {
    adapterInstance = new PhonemeAudioAdapter();
  }
  return adapterInstance;
}
