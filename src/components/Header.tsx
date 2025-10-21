import { BookOpen } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';

export function Header() {
  const percent = useProgressStore((state) => state.percent);

  return (
    <header
      className="bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-lg sticky top-0 z-50"
      role="banner"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen className="text-xl sm:text-2xl floating" aria-hidden="true" />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">自然拼读小课堂</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-20 sm:w-32 h-2 bg-gray-200/30 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full bg-gradient-to-r from-indigo-400 to-emerald-300 rounded-full"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={Math.round(percent)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="text-sm" aria-live="polite">
            {Math.round(percent)}%
          </span>
        </div>
      </div>
    </header>
  );
}
