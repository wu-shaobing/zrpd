/**
 * useWordAudio Hook
 * 用于播放示例单词的本地音频文件
 * 
 * 使用示例:
 * ```tsx
 * const { playWord, isPlaying } = useWordAudio();
 * 
 * <button onClick={() => playWord('apple')}>播放</button>
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseWordAudioOptions {
  basePath?: string; // 音频文件基础路径
  preload?: boolean; // 是否预加载音频
}

interface UseWordAudioReturn {
  playWord: (word: string) => Promise<boolean>;
  isPlaying: boolean;
  currentWord: string | null;
  preloadWord: (word: string) => Promise<boolean>;
}

// 音频缓存
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * 单词音频播放 Hook
 */
export function useWordAudio(
  options: UseWordAudioOptions = {}
): UseWordAudioReturn {
  const { basePath = '/audio/words', preload = false } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * 获取音频文件路径
   */
  const getAudioPath = useCallback(
    (word: string): string => {
      const filename = word.toLowerCase().trim();
      return `${basePath}/${filename}.mp3`;
    },
    [basePath]
  );

  /**
   * 预加载单词音频
   */
  const preloadWord = useCallback(
    async (word: string): Promise<boolean> => {
      const path = getAudioPath(word);
      
      // 如果已缓存，直接返回
      if (audioCache.has(path)) {
        return true;
      }

      try {
        const audio = new Audio(path);
        
        // 等待音频加载完成
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener('error', reject, { once: true });
          audio.load();
        });

        audioCache.set(path, audio);
        return true;
      } catch (error) {
        console.warn(`Failed to preload word audio: ${word}`, error);
        return false;
      }
    },
    [getAudioPath]
  );

  /**
   * 播放单词音频
   */
  const playWord = useCallback(
    async (word: string): Promise<boolean> => {
      if (!word || isPlaying) {
        return false;
      }

      const path = getAudioPath(word);

      try {
        // 停止当前播放
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }

        // 获取或创建音频对象
        let audio = audioCache.get(path);
        if (!audio) {
          audio = new Audio(path);
          
          // 预加载
          if (preload) {
            audioCache.set(path, audio);
          }
        }

        currentAudioRef.current = audio;

        // 设置事件监听
        const handlePlay = () => {
          setIsPlaying(true);
          setCurrentWord(word);
        };

        const handleEnded = () => {
          setIsPlaying(false);
          setCurrentWord(null);
          currentAudioRef.current = null;
        };

        const handleError = (error: Event) => {
          console.error(`Failed to play word: ${word}`, error);
          setIsPlaying(false);
          setCurrentWord(null);
          currentAudioRef.current = null;
        };

        audio.addEventListener('play', handlePlay, { once: true });
        audio.addEventListener('ended', handleEnded, { once: true });
        audio.addEventListener('error', handleError, { once: true });

        // 播放
        await audio.play();

        return true;
      } catch (error) {
        console.error(`Failed to play word: ${word}`, error);
        setIsPlaying(false);
        setCurrentWord(null);
        return false;
      }
    },
    [isPlaying, getAudioPath, preload]
  );

  // 清理函数
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  return {
    playWord,
    isPlaying,
    currentWord,
    preloadWord,
  };
}

/**
 * 快速播放单词（不需要状态管理的场景）
 * 
 * 使用示例:
 * ```tsx
 * <button onClick={() => playWordQuick('apple')}>
 *   播放
 * </button>
 * ```
 */
export async function playWordQuick(
  word: string,
  basePath: string = '/audio/words'
): Promise<boolean> {
  if (!word) return false;

  const filename = word.toLowerCase().trim();
  const path = `${basePath}/${filename}.mp3`;

  try {
    const audio = new Audio(path);
    await audio.play();
    return true;
  } catch (error) {
    console.error(`Failed to play word: ${word}`, error);
    return false;
  }
}

/**
 * 批量预加载单词音频
 */
export async function preloadWords(
  words: string[],
  basePath: string = '/audio/words'
): Promise<void> {
  const preloadPromises = words.map(async (word) => {
    const filename = word.toLowerCase().trim();
    const path = `${basePath}/${filename}.mp3`;
    
    if (audioCache.has(path)) return;

    try {
      const audio = new Audio(path);
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
      audioCache.set(path, audio);
    } catch (error) {
      console.warn(`Failed to preload word: ${word}`, error);
    }
  });

  await Promise.allSettled(preloadPromises);
}
