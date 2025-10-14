import { create } from 'zustand';

interface ScoreState {
  score: number;
  addScore: (points: number) => void;
  reset: () => void;
}

export const useScoreStore = create<ScoreState>((set) => ({
  score: 0,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  reset: () => set({ score: 0 }),
}));
