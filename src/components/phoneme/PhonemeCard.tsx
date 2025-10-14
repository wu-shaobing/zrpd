/**
 * 音标卡片组件
 * 用于展示单个音标的核心信息
 */

import { Volume2, Star, Check } from 'lucide-react';
import type { Phoneme } from '../../types/phoneme';
import { useSpeech } from '../../hooks/useSpeech';
import { usePhonicsStore } from '../../stores/phonicsStore';

interface PhonemeCardProps {
  phoneme: Phoneme;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  onClick?: () => void;
}

export function PhonemeCard({
  phoneme,
  variant = 'default',
  showProgress = true,
  onClick,
}: PhonemeCardProps) {
  const { speak } = useSpeech();
  const { getProgress, toggleFavorite } = usePhonicsStore();
  
  const progress = getProgress(phoneme.id);
  const isFavorite = progress.isFavorite;
  const masteryLevel = progress.masteryLevel;

  // 根据掌握度获取颜色
  const getMasteryColor = () => {
    if (masteryLevel >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (masteryLevel >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (masteryLevel > 0) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // 根据难度获取标签
  const getDifficultyLabel = () => {
    const labels = ['简单', '中等', '困难'];
    return labels[phoneme.difficulty - 1] || '简单';
  };

  // 根据难度获取颜色
  const getDifficultyColor = () => {
    const colors = [
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-red-100 text-red-700',
    ];
    return colors[phoneme.difficulty - 1] || colors[0];
  };

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const exampleWords = phoneme.examples.map(ex => ex.word).join(', ');
    speak(exampleWords);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(phoneme.id);
  };

  if (variant === 'compact') {
    return (
      <div
        className={`
          phoneme-card-compact
          p-3 rounded-lg border-2 cursor-pointer
          transition-all duration-200 hover:shadow-md
          ${getMasteryColor()}
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">/{phoneme.symbol}/</span>
            {isFavorite && <Star size={16} className="fill-yellow-400 text-yellow-400" />}
          </div>
          {masteryLevel >= 90 && (
            <Check size={20} className="text-green-600" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        phoneme-card
        bg-white rounded-xl p-6 border-2
        shadow-sm hover:shadow-lg
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${getMasteryColor()}
      `}
      onClick={onClick}
    >
      {/* 头部：音标符号 + 收藏 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-4xl font-bold mb-1">
            /{phoneme.symbol}/
          </div>
          <div className="text-sm text-gray-600">{phoneme.name}</div>
        </div>
        <button
          onClick={handleToggleFavorite}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isFavorite ? '取消收藏' : '收藏音标'}
        >
          <Star
            size={20}
            className={isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* 标签：难度 + 掌握状态 */}
      <div className="flex gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor()}`}>
          {getDifficultyLabel()}
        </span>
        {masteryLevel >= 90 && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <Check size={12} />
            已掌握
          </span>
        )}
      </div>

      {/* 发音指导 */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">{phoneme.pronunciation.cn}</p>
        <p className="text-xs text-gray-500 italic">{phoneme.pronunciation.tips}</p>
      </div>

      {/* 示例单词 */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">示例单词</h4>
        <div className="flex flex-wrap gap-2">
          {phoneme.examples.slice(0, 3).map((example, index) => (
            <div
              key={index}
              className="text-sm px-3 py-1 bg-gray-50 rounded-full border border-gray-200"
            >
              {example.word}
            </div>
          ))}
        </div>
      </div>

      {/* 进度条 */}
      {showProgress && masteryLevel > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">掌握度</span>
            <span className="text-xs font-semibold text-gray-700">{masteryLevel}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                masteryLevel >= 90
                  ? 'bg-green-500'
                  : masteryLevel >= 60
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${masteryLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* 播放按钮 */}
      <button
        onClick={handlePlaySound}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        <Volume2 size={18} />
        听发音
      </button>
    </div>
  );
}
