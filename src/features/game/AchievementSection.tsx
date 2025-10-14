import { Trophy, Lightbulb, ClipboardCheck } from 'lucide-react';
import { useScoreStore } from '../../stores/scoreStore';

export function AchievementSection() {
  const score = useScoreStore((state) => state.score);
  
  // Mock mastered letters for MVP
  const masteredLetters = ['A', 'B', 'C'];
  const allLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <section className="section mb-16" id="achievement">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
          <Trophy aria-hidden="true" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">我的学习成果</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-indigo-600" id="score" aria-live="polite">
            {score}
          </span>
          <span className="text-xl ml-1">分</span>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-2">已掌握字母</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {allLetters.map((letter) => {
              const isMastered = masteredLetters.includes(letter);
              return (
                <div
                  key={letter}
                  className={`w-8 h-8 ${
                    isMastered ? 'bg-emerald-100 text-emerald-500' : 'bg-gray-100 text-gray-400'
                  } rounded-full flex items-center justify-center`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        </div>

        <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-medium transition-colors mb-4">
          完成小测验
          <ClipboardCheck size={20} aria-hidden="true" />
        </button>

        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
          <Lightbulb className="text-yellow-500" size={16} aria-hidden="true" />
          提示：完成所有游戏和测验可以获得更多积分哦！
        </p>
      </div>
    </section>
  );
}
