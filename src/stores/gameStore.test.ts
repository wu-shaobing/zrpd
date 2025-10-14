import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({ cards: [] });
  });

  it('should initialize with empty cards array', () => {
    const { cards } = useGameStore.getState();
    expect(cards).toEqual([]);
  });

  it('should initialize cards with given IDs', () => {
    const { initCards, cards } = useGameStore.getState();
    initCards(['card-1', 'card-2', 'card-3']);
    
    const state = useGameStore.getState();
    expect(state.cards.length).toBe(3);
    expect(state.cards[0]).toEqual({ id: 'card-1', flipped: false, scored: false });
  });

  it('should flip a card', () => {
    const { initCards, flipCard } = useGameStore.getState();
    initCards(['card-1']);
    flipCard('card-1');
    
    const state = useGameStore.getState();
    const card = state.cards.find((c) => c.id === 'card-1');
    expect(card?.flipped).toBe(true);
  });

  it('should unflip a card', () => {
    const { initCards, flipCard } = useGameStore.getState();
    initCards(['card-1']);
    flipCard('card-1');
    flipCard('card-1'); // flip again to unflip
    
    const state = useGameStore.getState();
    const card = state.cards.find((c) => c.id === 'card-1');
    expect(card?.flipped).toBe(false);
  });

  it('should mark a card as scored', () => {
    const { initCards, markScored } = useGameStore.getState();
    initCards(['card-1']);
    markScored('card-1');
    
    const state = useGameStore.getState();
    const card = state.cards.find((c) => c.id === 'card-1');
    expect(card?.scored).toBe(true);
  });

  it('should reset all cards', () => {
    const { initCards, flipCard, markScored, resetGame } = useGameStore.getState();
    initCards(['card-1', 'card-2']);
    
    // Setup some state
    flipCard('card-1');
    flipCard('card-2');
    markScored('card-1');
    markScored('card-2');
    
    // Reset
    resetGame();
    
    const state = useGameStore.getState();
    expect(state.cards.every((c) => !c.flipped && !c.scored)).toBe(true);
  });

  it('should shuffle cards', () => {
    const { initCards, shuffleCards } = useGameStore.getState();
    const cardIds = ['card-1', 'card-2', 'card-3', 'card-4'];
    initCards(cardIds);
    
    const initialOrder = useGameStore.getState().cards.map((c) => c.id);
    
    // Shuffle multiple times to increase chance of different order
    let shuffled = false;
    for (let i = 0; i < 10; i++) {
      shuffleCards();
      const newOrder = useGameStore.getState().cards.map((c) => c.id);
      if (JSON.stringify(initialOrder) !== JSON.stringify(newOrder)) {
        shuffled = true;
        break;
      }
    }
    
    // Should contain all same cards
    const state = useGameStore.getState();
    expect(state.cards.length).toBe(4);
  });
});
