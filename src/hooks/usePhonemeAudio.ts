/**
 * usePhonemeAudio Hook
 * 封装 PhonemeAudioAdapter，提供 React 友好的音素播放接口
 * 
 * 使用示例:
 * ```tsx
 * const { play, isPlaying, strategy } = usePhonemeAudio();
 * 
 * <button onClick={() => play('v1')}>播放音素</button>
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPhonemeAudioAdapter,
  type PhonemeAudioAdapter,
} from '../utils/phonemeAudioAdapter';
import type { PhonemePlayOptions, PlaybackStrategy } from '../types/phoneme-audio';

interface UsePhonemeAudioOptions {
  autoInit?: boolean; // 自动初始化适配器（默认true）
  preloadSprites?: string[]; // 预加载的sprite列表
}

interface UsePhonemeAudioReturn {
  play: (phonemeId: string, options?: PhonemePlayOptions) => Promise<boolean>;
  isPlaying: boolean;
  lastStrategy: PlaybackStrategy | null;
  availableStrategies: PlaybackStrategy[];
  isInitialized: boolean;
  preloadSprite: (spriteKey: string) => Promise<boolean>;
  preloadAll: () => Promise<void>;
}

/**
 * 音素音频播放 Hook
 */
export function usePhonemeAudio(
  options: UsePhonemeAudioOptions = {}
): UsePhonemeAudioReturn {
  const { autoInit = true, preloadSprites = [] } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [lastStrategy, setLastStrategy] = useState<PlaybackStrategy | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableStrategies, setAvailableStrategies] = useState<PlaybackStrategy[]>([]);

  const adapterRef = useRef<PhonemeAudioAdapter | null>(null);

  // 获取适配器实例
  useEffect(() => {
    adapterRef.current = getPhonemeAudioAdapter();
    setAvailableStrategies(adapterRef.current.getAvailableStrategies());
  }, []);

  // 自动初始化
  useEffect(() => {
    if (!autoInit || !adapterRef.current) return;

    const initAdapter = async () => {
      try {
        await adapterRef.current!.init();
        setIsInitialized(true);

        // 预加载指定的sprites
        if (preloadSprites.length > 0) {
          await Promise.allSettled(
            preloadSprites.map((key) => adapterRef.current!.preloadSprite(key))
          );
        }
      } catch (error) {
        console.error('Failed to initialize PhonemeAudioAdapter:', error);
      }
    };

    initAdapter();
  }, [autoInit, preloadSprites]);

  /**
   * 播放音素
   */
  const play = useCallback(
    async (phonemeId: string, playOptions: PhonemePlayOptions = {}): Promise<boolean> => {
      if (!adapterRef.current) {
        console.warn('PhonemeAudioAdapter not available');
        return false;
      }

      // 确保已初始化
      if (!isInitialized) {
        await adapterRef.current.init();
        setIsInitialized(true);
      }

      setIsPlaying(true);

      try {
        const result = await adapterRef.current.playPhoneme(phonemeId, {
          ...playOptions,
          onStart: () => {
            setIsPlaying(true);
            playOptions.onStart?.();
          },
          onEnd: () => {
            setIsPlaying(false);
            playOptions.onEnd?.();
          },
          onError: (error) => {
            setIsPlaying(false);
            playOptions.onError?.(error);
          },
        });

        setLastStrategy(result.strategy);
        return result.success;
      } catch (error) {
        console.error('Failed to play phoneme:', error);
        setIsPlaying(false);
        return false;
      }
    },
    [isInitialized]
  );

  /**
   * 预加载单个sprite
   */
  const preloadSprite = useCallback(async (spriteKey: string): Promise<boolean> => {
    if (!adapterRef.current) return false;

    try {
      return await adapterRef.current.preloadSprite(spriteKey);
    } catch (error) {
      console.error(`Failed to preload sprite ${spriteKey}:`, error);
      return false;
    }
  }, []);

  /**
   * 预加载所有sprites
   */
  const preloadAll = useCallback(async (): Promise<void> => {
    if (!adapterRef.current) return;

    try {
      await adapterRef.current.preloadAll();
    } catch (error) {
      console.error('Failed to preload all sprites:', error);
    }
  }, []);

  return {
    play,
    isPlaying,
    lastStrategy,
    availableStrategies,
    isInitialized,
    preloadSprite,
    preloadAll,
  };
}

/**
 * 快速播放音素（不需要状态管理的场景）
 * 
 * 使用示例:
 * ```tsx
 * <button onClick={() => playPhonemeQuick('v1')}>
 *   播放
 * </button>
 * ```
 */
export async function playPhonemeQuick(
  phonemeId: string,
  options?: PhonemePlayOptions
): Promise<boolean> {
  const adapter = getPhonemeAudioAdapter();
  
  // 确保初始化
  await adapter.init();
  
  const result = await adapter.playPhoneme(phonemeId, options);
  return result.success;
}

/**
 * 批量预加载音素sprites（适合在应用启动时调用）
 */
export async function preloadPhonemeSprites(
  spriteKeys: string[] = ['phonemes-vowels', 'phonemes-consonants']
): Promise<void> {
  const adapter = getPhonemeAudioAdapter();
  await adapter.init();
  
  await Promise.allSettled(
    spriteKeys.map((key) => adapter.preloadSprite(key))
  );
}
