import { useEffect } from 'react';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useScoreStore } from '../../stores/scoreStore';
import gameCardsData from '../../data/game-cards.json';
import { GameCard } from './GameCard';

export function GameSection() {
  const cards = useGameStore((state) => state.cards);
  const initCards = useGameStore((state) => state.initCards);
  const resetGame = useGameStore((state) => state.resetGame);
  const shuffleCards = useGameStore((state) => state.shuffleCards);
  const resetScore = useScoreStore((state) => state.reset);

  useEffect(() => {
    initCards(gameCardsData.map((card) => card.id));
    shuffleCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时初始化一次

  const handleReset = () => {
    resetGame();
    resetScore();
    shuffleCards();
  };

  return (
    <section className="section mb-16" id="game" aria-labelledby="game-title">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
          <Gamepad2 aria-hidden="true" />
        </div>
        <h2 id="game-title" className="text-2xl md:text-3xl font-bold">
          趣味拼读游戏
        </h2>
      </div>

      <p className="text-center text-lg text-gray-600 mb-8">
        试试把字母和对应的发音配对吧！点击卡片翻过来看看是否正确~
      </p>

      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        id="game-grid"
      >
        {cards.map((cardState) => {
          const cardData = gameCardsData.find((c) => c.id === cardState.id);
          if (!cardData) return null;
          return (
            <GameCard
              key={cardState.id}
              card={cardData}
              flipped={cardState.flipped}
              scored={cardState.scored}
            />
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          id="reset-game"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
          onClick={handleReset}
        >
          重置游戏
          <RotateCcw size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
