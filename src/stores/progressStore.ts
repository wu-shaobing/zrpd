import { create } from 'zustand';

interface ProgressState {
  percent: number;
  setPercent: (value: number) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  percent: 0,
  setPercent: (value) => set({ percent: Math.min(100, Math.max(0, value)) }),
}));
