import { describe, it, expect, beforeEach } from 'vitest';
import { useScoreStore } from './scoreStore';

describe('scoreStore', () => {
  beforeEach(() => {
    useScoreStore.setState({ score: 0 });
  });

  it('should initialize with score 0', () => {
    const { score } = useScoreStore.getState();
    expect(score).toBe(0);
  });

  it('should add score with specific points', () => {
    const { addScore } = useScoreStore.getState();
    addScore(10);
    
    const { score } = useScoreStore.getState();
    expect(score).toBe(10);
  });

  it('should add custom score points', () => {
    const { addScore } = useScoreStore.getState();
    addScore(25);
    
    const { score } = useScoreStore.getState();
    expect(score).toBe(25);
  });

  it('should accumulate scores', () => {
    const { addScore } = useScoreStore.getState();
    addScore(10);
    addScore(15);
    addScore(5);
    
    const { score } = useScoreStore.getState();
    expect(score).toBe(30);
  });

  it('should reset score to 0', () => {
    const { addScore, reset } = useScoreStore.getState();
    addScore(50);
    reset();
    
    const { score } = useScoreStore.getState();
    expect(score).toBe(0);
  });

  it('should allow negative point adjustments', () => {
    const { addScore } = useScoreStore.getState();
    addScore(50);
    addScore(-10);
    
    const { score } = useScoreStore.getState();
    // Store allows negative adjustments, final score is 40
    expect(score).toBe(40);
  });
});
