/**
 * 音标卡片组件
 * 用于展示单个音标的核心信息
 */

import { Volume2, Star, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { Phoneme } from '../../types/phoneme';
import { usePhonemeAudio } from '../../hooks/usePhonemeAudio';
import { useWordAudio } from '../../hooks/useWordAudio';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLessonPlaying, setIsLessonPlaying] = useState(false);
  const { play, isPlaying } = usePhonemeAudio();
  const { playWord } = useWordAudio();
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

  const handlePlaySound = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 使用新的音频适配器播放音素
    // 传入音素ID，适配器会自动选择最佳播放策略
    await play(phoneme.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(phoneme.id);
  };

  // 播放示例单词发音
  const handlePlayWord = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    
    // 使用本地音频文件播放单词
    await playWord(word);
  };

  // 翻转卡片
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮，不翻转
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    setIsFlipped(!isFlipped);
    onClick?.();
  };

  // 播放讲解音频
  const handlePlayLesson = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const base = import.meta.env.BASE_URL || '/';
    const lessonAudio = new Audio(`${base}audio/lessons/${phoneme.id}-lesson.mp3`);
    
    setIsLessonPlaying(true);
    
    lessonAudio.addEventListener('ended', () => {
      setIsLessonPlaying(false);
    });
    
    lessonAudio.addEventListener('error', () => {
      console.error('Failed to play lesson audio');
      setIsLessonPlaying(false);
    });
    
    try {
      await lessonAudio.play();
    } catch (error) {
      console.error('Failed to play lesson:', error);
      setIsLessonPlaying(false);
    }
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
      className="phoneme-card-container relative"
      style={{
        perspective: '1000px',
        minHeight: '400px',
      }}
    >
      <div
        className={`phoneme-card-flipper relative w-full h-full transition-transform duration-500 ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 卡片正面 */}
        <div
          className={`
            phoneme-card-front
            absolute inset-0
            bg-white rounded-xl p-6 border-2
            shadow-sm hover:shadow-lg
            transition-all duration-200
            cursor-pointer
            ${getMasteryColor()}
          `}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          onClick={handleCardClick}
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
            <button
              key={index}
              onClick={(e) => handlePlayWord(e, example.word)}
              className="text-sm px-3 py-1 bg-gray-50 rounded-full border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
              aria-label={`播放单词 ${example.word}`}
            >
              {example.word}
            </button>
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
        disabled={isPlaying}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`播放 ${phoneme.name} 的发音`}
      >
        <Volume2 size={18} className={isPlaying ? 'animate-pulse' : ''} />
        {isPlaying ? '播放中...' : '听发音'}
      </button>
        </div>

        {/* 卡片背面 - 详细讲解 */}
        <div
          className="phoneme-card-back absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 shadow-lg overflow-y-auto cursor-pointer"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          onClick={handleCardClick}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-5xl font-bold text-indigo-600">/{phoneme.symbol}/</div>
              <div>
                <div className="text-lg font-semibold text-gray-800">{phoneme.name}</div>
                <div className="text-xs text-gray-500">点击翻回正面</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              aria-label="翻回正面"
            >
              <RotateCcw size={20} className="text-indigo-600" />
            </button>
          </div>

          {/* 讲解内容 */}
          <div className="space-y-4 text-sm">
            {/* 发音要领 */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                📖 发音要领
              </h3>
              <p className="text-gray-700 mb-2">{phoneme.pronunciation.cn}</p>
              <p className="text-xs text-gray-600">💡 <strong>技巧：</strong>{phoneme.pronunciation.tips}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="bg-indigo-50 rounded px-2 py-1">
                  <span className="text-gray-600">👄 嘴型：</span>
                  <span className="font-medium text-gray-800">{phoneme.pronunciation.mouthShape}</span>
                </div>
                <div className="bg-purple-50 rounded px-2 py-1">
                  <span className="text-gray-600">👅 舌位：</span>
                  <span className="font-medium text-gray-800">{phoneme.pronunciation.tonguePosition}</span>
                </div>
              </div>
            </div>

            {/* 示例单词 */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                📝 示例单词
              </h3>
              <div className="space-y-2">
                {phoneme.examples.slice(0, 3).map((example, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={(e) => handlePlayWord(e, example.word)}
                        className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        {example.word}
                      </button>
                      <span className="text-gray-500 text-xs ml-2">{example.phonetic}</span>
                      <span className="text-gray-600 ml-2">- {example.translation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 常见错误 */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                ⚠️ 常见错误
              </h3>
              <ul className="space-y-1 text-gray-700">
                {phoneme.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 播放讲解按钮 */}
            <button
              onClick={handlePlayLesson}
              disabled={isLessonPlaying}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="播放详细讲解"
            >
              <Volume2 size={20} className={isLessonPlaying ? 'animate-pulse' : ''} />
              {isLessonPlaying ? '讲解中...' : '👩‍🏫 听老师讲解'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
