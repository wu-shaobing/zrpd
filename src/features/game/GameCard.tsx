import { CheckCircle } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useScoreStore } from '../../stores/scoreStore';
import { getColorClasses, type ColorName } from '../../utils/colors';

interface GameCardProps {
  card: {
    id: string;
    front: string;
    ipa: string;
    examples: string[];
    points: number;
    color: string;
  };
  flipped: boolean;
  scored: boolean;
}

export function GameCard({ card, flipped, scored }: GameCardProps) {
  const flipCard = useGameStore((state) => state.flipCard);
  const markScored = useGameStore((state) => state.markScored);
  const addScore = useScoreStore((state) => state.addScore);

  const handleClick = () => {
    // Flip the card first
    flipCard(card.id);
    
    // First time flipping to back: add score and mark as scored
    if (!flipped && !scored) {
      addScore(card.points);
      markScored(card.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const colors = getColorClasses(card.color as ColorName);

  return (
    <div
      className={`game-card bg-white rounded-lg p-6 shadow-md text-center cursor-pointer ${
        flipped ? 'flipped' : ''
      }`}
      tabIndex={0}
      role="button"
      aria-label={`字母组合 ${card.front} 卡片，按空格翻转`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {!flipped ? (
        <div className="front">
          <div
            className={`w-16 h-16 ${colors.bg100} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <span className={`text-2xl font-bold ${colors.text600}`}>
              {card.front}
            </span>
          </div>
          <p className="text-gray-500">点击翻卡</p>
        </div>
      ) : (
        <div className="back text-center">
          <p className="text-xl font-semibold mb-2">{card.ipa}</p>
          <p className="text-sm text-gray-600">{card.examples.join(', ')}</p>
          <CheckCircle
            className="text-emerald-500 mt-2 mx-auto"
            size={24}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
