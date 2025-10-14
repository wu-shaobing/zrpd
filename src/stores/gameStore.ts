import { create } from 'zustand';

interface CardState {
  id: string;
  flipped: boolean;
  scored: boolean;
}

interface GameState {
  cards: CardState[];
  initCards: (ids: string[]) => void;
  flipCard: (id: string) => void;
  markScored: (id: string) => void;
  resetGame: () => void;
  shuffleCards: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  cards: [],
  initCards: (ids) =>
    set({
      cards: ids.map((id) => ({ id, flipped: false, scored: false })),
    }),
  flipCard: (id) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, flipped: !card.flipped } : card
      ),
    })),
  markScored: (id) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, scored: true } : card
      ),
    })),
  resetGame: () =>
    set((state) => ({
      cards: state.cards.map((card) => ({
        ...card,
        flipped: false,
        scored: false,
      })),
    })),
  shuffleCards: () =>
    set((state) => ({
      cards: [...state.cards].sort(() => Math.random() - 0.5),
    })),
}));
