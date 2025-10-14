/**
 * 音标分类过滤组件
 * 用于按类别筛选音标
 */

import type { PhonemeCategory } from '../../types/phoneme';

interface CategoryFilterProps {
  categories: Array<{
    value: PhonemeCategory | 'all';
    label: string;
    count: number;
  }>;
  activeCategory: PhonemeCategory | 'all';
  onChange: (category: PhonemeCategory | 'all') => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.value;
        return (
          <button
            key={category.value}
            onClick={() => onChange(category.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {category.label}
            <span
              className={`ml-2 ${
                isActive ? 'text-indigo-200' : 'text-gray-500'
              }`}
            >
              ({category.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
