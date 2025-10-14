/**
 * 音标学习状态管理
 * 使用 Zustand 管理48音标学习进度，支持持久化
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PhonemeProgress, LearningStats } from '../types/phoneme';

interface PhonicsState {
  // 学习进度数据
  progress: Record<string, PhonemeProgress>;
  
  // 学习统计
  stats: LearningStats;
  
  // 收藏的音标ID列表
  favorites: string[];
  
  // Actions
  updateProgress: (phonemeId: string, updates: Partial<PhonemeProgress>) => void;
  markAsMastered: (phonemeId: string) => void;
  recordPractice: (phonemeId: string, correct: boolean) => void;
  toggleFavorite: (phonemeId: string) => void;
  getProgress: (phonemeId: string) => PhonemeProgress;
  getMasteredPhonemes: () => string[];
  getInProgressPhonemes: () => string[];
  resetProgress: (phonemeId?: string) => void;
  updateStats: (updates: Partial<LearningStats>) => void;
}

// 默认进度数据
const createDefaultProgress = (phonemeId: string): PhonemeProgress => ({
  phonemeId,
  masteryLevel: 0,
  practiceCount: 0,
  correctCount: 0,
  lastPracticed: new Date().toISOString(),
  isFavorite: false,
});

// 默认统计数据
const defaultStats: LearningStats = {
  totalPhonemes: 48,
  masteredPhonemes: 0,
  inProgressPhonemes: 0,
  totalPracticeTime: 0,
  currentStreak: 0,
};

export const usePhonicsStore = create<PhonicsState>()(
  persist(
    (set, get) => ({
      progress: {},
      stats: defaultStats,
      favorites: [],

      // 更新进度
      updateProgress: (phonemeId, updates) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [phonemeId]: {
              ...(state.progress[phonemeId] || createDefaultProgress(phonemeId)),
              ...updates,
              lastPracticed: new Date().toISOString(),
            },
          },
        })),

      // 标记为已掌握
      markAsMastered: (phonemeId) =>
        set((state) => {
          const currentProgress = state.progress[phonemeId] || createDefaultProgress(phonemeId);
          const wasMastered = currentProgress.masteryLevel >= 90;
          const newMasteryLevel = 100;

          return {
            progress: {
              ...state.progress,
              [phonemeId]: {
                ...currentProgress,
                masteryLevel: newMasteryLevel,
                lastPracticed: new Date().toISOString(),
              },
            },
            stats: {
              ...state.stats,
              masteredPhonemes: wasMastered
                ? state.stats.masteredPhonemes
                : state.stats.masteredPhonemes + 1,
            },
          };
        }),

      // 记录练习
      recordPractice: (phonemeId, correct) =>
        set((state) => {
          const currentProgress = state.progress[phonemeId] || createDefaultProgress(phonemeId);
          const newPracticeCount = currentProgress.practiceCount + 1;
          const newCorrectCount = currentProgress.correctCount + (correct ? 1 : 0);
          
          // 计算新的掌握度（基于正确率）
          const accuracy = newCorrectCount / newPracticeCount;
          const newMasteryLevel = Math.min(100, Math.round(accuracy * 100));

          const wasInProgress = currentProgress.masteryLevel > 0 && currentProgress.masteryLevel < 90;
          const isNowInProgress = newMasteryLevel > 0 && newMasteryLevel < 90;

          return {
            progress: {
              ...state.progress,
              [phonemeId]: {
                ...currentProgress,
                practiceCount: newPracticeCount,
                correctCount: newCorrectCount,
                masteryLevel: newMasteryLevel,
                lastPracticed: new Date().toISOString(),
              },
            },
            stats: {
              ...state.stats,
              inProgressPhonemes: wasInProgress === isNowInProgress
                ? state.stats.inProgressPhonemes
                : isNowInProgress
                ? state.stats.inProgressPhonemes + 1
                : state.stats.inProgressPhonemes - 1,
            },
          };
        }),

      // 切换收藏状态
      toggleFavorite: (phonemeId) =>
        set((state) => {
          const isFavorite = state.favorites.includes(phonemeId);
          const currentProgress = state.progress[phonemeId] || createDefaultProgress(phonemeId);

          return {
            favorites: isFavorite
              ? state.favorites.filter((id) => id !== phonemeId)
              : [...state.favorites, phonemeId],
            progress: {
              ...state.progress,
              [phonemeId]: {
                ...currentProgress,
                isFavorite: !isFavorite,
              },
            },
          };
        }),

      // 获取进度
      getProgress: (phonemeId) => {
        const state = get();
        return state.progress[phonemeId] || createDefaultProgress(phonemeId);
      },

      // 获取已掌握的音标
      getMasteredPhonemes: () => {
        const state = get();
        return Object.values(state.progress)
          .filter((p) => p.masteryLevel >= 90)
          .map((p) => p.phonemeId);
      },

      // 获取学习中的音标
      getInProgressPhonemes: () => {
        const state = get();
        return Object.values(state.progress)
          .filter((p) => p.masteryLevel > 0 && p.masteryLevel < 90)
          .map((p) => p.phonemeId);
      },

      // 重置进度
      resetProgress: (phonemeId) =>
        set((state) => {
          if (phonemeId) {
            const { [phonemeId]: _, ...rest } = state.progress;
            return { progress: rest };
          }
          return { progress: {}, stats: defaultStats, favorites: [] };
        }),

      // 更新统计
      updateStats: (updates) =>
        set((state) => ({
          stats: {
            ...state.stats,
            ...updates,
          },
        })),
    }),
    {
      name: 'phonics-storage', // localStorage key
      partialize: (state) => ({
        progress: state.progress,
        stats: state.stats,
        favorites: state.favorites,
      }),
    }
  )
);
