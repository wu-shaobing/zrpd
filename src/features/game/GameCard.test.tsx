import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GameCard } from './GameCard';
import { useGameStore } from '../../stores/gameStore';
import { useScoreStore } from '../../stores/scoreStore';

describe('GameCard', () => {
  const mockCard = {
    id: 'test-card-1',
    front: 'ea',
    ipa: '/iː/',
    examples: ['eat', 'tea'],
    points: 10,
    color: 'blue',
  };

  beforeEach(() => {
    // Reset stores
    useGameStore.setState({ cards: [] });
    useScoreStore.setState({ score: 0 });
    
    // Initialize with test card
    useGameStore.getState().initCards(['test-card-1']);
  });

  it('should render front content by default', () => {
    render(<GameCard card={mockCard} flipped={false} scored={false} />);
    expect(screen.getByText('ea')).toBeInTheDocument();
    expect(screen.getByText('点击翻卡')).toBeInTheDocument();
  });

  it('should flip card on click', async () => {
    const user = userEvent.setup();
    render(<GameCard card={mockCard} flipped={false} scored={false} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    const state = useGameStore.getState();
    const flippedCard = state.cards.find((c) => c.id === mockCard.id);
    expect(flippedCard?.flipped).toBe(true);
  });

  it('should show back content when flipped', async () => {
    render(<GameCard card={mockCard} flipped={true} scored={false} />);
    
    // Should show IPA and examples
    expect(screen.getByText('/iː/')).toBeInTheDocument();
    expect(screen.getByText('eat, tea')).toBeInTheDocument();
  });

  it('should add score only on first flip', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<GameCard card={mockCard} flipped={false} scored={false} />);
    
    const card = screen.getByRole('button');
    
    // First flip - should add score
    await user.click(card);
    const state = useGameStore.getState();
    const cardState = state.cards.find((c) => c.id === mockCard.id);
    
    // Rerender with flipped state
    rerender(<GameCard card={mockCard} flipped={cardState!.flipped} scored={cardState!.scored} />);
    
    let score = useScoreStore.getState().score;
    expect(score).toBe(10);
    expect(cardState?.scored).toBe(true);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<GameCard card={mockCard} flipped={false} scored={false} />);
    
    const card = screen.getByRole('button');
    
    // Tab to focus
    await user.tab();
    expect(card).toHaveFocus();
    
    // Enter to flip
    await user.keyboard('{Enter}');
    const state = useGameStore.getState();
    const cardState = state.cards.find((c) => c.id === mockCard.id);
    expect(cardState?.flipped).toBe(true);
  });

  it('should have proper ARIA attributes', () => {
    render(<GameCard card={mockCard} flipped={false} scored={false} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
