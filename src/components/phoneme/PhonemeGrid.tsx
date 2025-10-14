/**
 * 音标网格组件
 * 用于展示音标列表的网格布局
 */

import { PhonemeCard } from './PhonemeCard';
import type { Phoneme } from '../../types/phoneme';

interface PhonemeGridProps {
  phonemes: Phoneme[];
  variant?: 'default' | 'compact';
  columns?: 2 | 3 | 4 | 5;
  showProgress?: boolean;
  onPhonemeClick?: (phoneme: Phoneme) => void;
  emptyMessage?: string;
}

export function PhonemeGrid({
  phonemes,
  variant = 'default',
  columns = 4,
  showProgress = true,
  onPhonemeClick,
  emptyMessage = '暂无音标数据',
}: PhonemeGridProps) {
  if (phonemes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const getGridCols = () => {
    const colsMap = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    };
    return colsMap[columns];
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {phonemes.map((phoneme) => (
        <PhonemeCard
          key={phoneme.id}
          phoneme={phoneme}
          variant={variant}
          showProgress={showProgress}
          onClick={onPhonemeClick ? () => onPhonemeClick(phoneme) : undefined}
        />
      ))}
    </div>
  );
}
