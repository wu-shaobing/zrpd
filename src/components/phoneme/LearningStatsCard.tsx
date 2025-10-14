/**
 * 学习统计卡片组件
 * 展示用户学习进度统计
 */

import { Target, TrendingUp, Award, Flame } from 'lucide-react';
import type { LearningStats } from '../../types/phoneme';

interface LearningStatsCardProps {
  stats: LearningStats;
}

export function LearningStatsCard({ stats }: LearningStatsCardProps) {
  const { totalPhonemes, masteredPhonemes, inProgressPhonemes, currentStreak } =
    stats;

  const masteryPercentage = Math.round(
    (masteredPhonemes / totalPhonemes) * 100
  );

  const statsItems = [
    {
      icon: Target,
      label: '已掌握',
      value: masteredPhonemes,
      total: totalPhonemes,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: '学习中',
      value: inProgressPhonemes,
      total: totalPhonemes,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Award,
      label: '完成度',
      value: `${masteryPercentage}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Flame,
      label: '连续天数',
      value: currentStreak,
      suffix: '天',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Award className="text-indigo-600" size={24} />
        学习统计
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsItems.map((item, index) => (
          <div
            key={index}
            className={`${item.bgColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <item.icon className={item.color} size={20} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </span>
              {item.total && (
                <span className="text-sm text-gray-500">/ {item.total}</span>
              )}
              {item.suffix && (
                <span className="text-sm text-gray-500">{item.suffix}</span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 进度条 */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            整体掌握进度
          </span>
          <span className="text-sm font-bold text-indigo-600">
            {masteryPercentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
