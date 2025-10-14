import { useState } from 'react';
import { Languages } from 'lucide-react';
import { PhonemeGrid } from '../../components/phoneme/PhonemeGrid';
import { CategoryFilter } from '../../components/phoneme/CategoryFilter';
import { phonemeService } from '../../services/phonemeService';
import type { PhonemeCategory } from '../../types/phoneme';

export function VowelsSection() {
  const [activeCategory, setActiveCategory] = useState<PhonemeCategory | 'all'>('all');
  
  const allVowels = phonemeService.getAllVowels();
  
  // 按类别筛选
  const filteredVowels =
    activeCategory === 'all'
      ? allVowels
      : allVowels.filter((v) => v.category === activeCategory);

  // 统计各类别数量
  const categories = [
    { value: 'all' as const, label: '全部元音', count: allVowels.length },
    {
      value: 'short_vowel' as PhonemeCategory,
      label: '短元音',
      count: allVowels.filter((v) => v.category === 'short_vowel').length,
    },
    {
      value: 'long_vowel' as PhonemeCategory,
      label: '长元音',
      count: allVowels.filter((v) => v.category === 'long_vowel').length,
    },
    {
      value: 'diphthong' as PhonemeCategory,
      label: '双元音',
      count: allVowels.filter((v) => v.category === 'diphthong').length,
    },
  ];

  return (
    <section className="section mb-16" id="vowels" aria-labelledby="vowels-title">
      <div className="flex items-center mb-8">
        <div
          className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg"
          aria-hidden="true"
        >
          <Languages />
        </div>
        <div>
          <h2 id="vowels-title" className="text-2xl md:text-3xl font-bold">
            元音音标
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            共 {allVowels.length} 个元音音标，包括短元音、长元音和双元音
          </p>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* 音标网格 */}
      <PhonemeGrid
        phonemes={filteredVowels}
        variant="default"
        columns={4}
        showProgress={true}
        emptyMessage="暂无该类别的元音音标"
      />
    </section>
  );
}
