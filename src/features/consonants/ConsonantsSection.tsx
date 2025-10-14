import { useState } from 'react';
import { Type } from 'lucide-react';
import { PhonemeGrid } from '../../components/phoneme/PhonemeGrid';
import { CategoryFilter } from '../../components/phoneme/CategoryFilter';
import { phonemeService } from '../../services/phonemeService';
import type { PhonemeCategory } from '../../types/phoneme';

export function ConsonantsSection() {
  const [activeCategory, setActiveCategory] = useState<PhonemeCategory | 'all'>('all');
  
  const allConsonants = phonemeService.getAllConsonants();
  
  // 按类别筛选
  const filteredConsonants =
    activeCategory === 'all'
      ? allConsonants
      : allConsonants.filter((c) => c.category === activeCategory);

  // 统计各类别数量
  const categories = [
    { value: 'all' as const, label: '全部辅音', count: allConsonants.length },
    {
      value: 'plosive' as PhonemeCategory,
      label: '爆破音',
      count: allConsonants.filter((c) => c.category === 'plosive').length,
    },
    {
      value: 'fricative' as PhonemeCategory,
      label: '摩擦音',
      count: allConsonants.filter((c) => c.category === 'fricative').length,
    },
    {
      value: 'affricate' as PhonemeCategory,
      label: '破擦音',
      count: allConsonants.filter((c) => c.category === 'affricate').length,
    },
    {
      value: 'nasal' as PhonemeCategory,
      label: '鼻音',
      count: allConsonants.filter((c) => c.category === 'nasal').length,
    },
  ];

  return (
    <section className="section mb-16" id="consonants" aria-labelledby="consonants-title">
      <div className="flex items-center mb-8">
        <div
          className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg"
          aria-hidden="true"
        >
          <Type />
        </div>
        <div>
          <h2 id="consonants-title" className="text-2xl md:text-3xl font-bold">
            辅音音标
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            共 {allConsonants.length} 个辅音音标，包括爆破音、摩擦音、破擦音、鼻音等
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
        phonemes={filteredConsonants}
        variant="default"
        columns={4}
        showProgress={true}
        emptyMessage="暂无该类别的辅音音标"
      />
    </section>
  );
}
