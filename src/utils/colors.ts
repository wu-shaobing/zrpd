/**
 * 颜色映射工具 - 解决 Tailwind JIT 动态类名问题
 * Tailwind JIT 需要静态可分析的类名，动态拼接无法被检测
 */

export type ColorName = 
  | 'red' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'indigo' 
  | 'teal' 
  | 'amber' 
  | 'emerald' 
  | 'violet';

interface ColorClasses {
  bg100: string;
  text500: string;
  text600: string;
}

/**
 * 预定义的颜色类名映射
 * 所有类名都是静态字符串，可被 Tailwind JIT 正确识别
 */
const colorMap: Record<ColorName, ColorClasses> = {
  red: {
    bg100: 'bg-red-100',
    text500: 'text-red-500',
    text600: 'text-red-600',
  },
  yellow: {
    bg100: 'bg-yellow-100',
    text500: 'text-yellow-500',
    text600: 'text-yellow-600',
  },
  green: {
    bg100: 'bg-green-100',
    text500: 'text-green-500',
    text600: 'text-green-600',
  },
  blue: {
    bg100: 'bg-blue-100',
    text500: 'text-blue-500',
    text600: 'text-blue-600',
  },
  purple: {
    bg100: 'bg-purple-100',
    text500: 'text-purple-500',
    text600: 'text-purple-600',
  },
  pink: {
    bg100: 'bg-pink-100',
    text500: 'text-pink-500',
    text600: 'text-pink-600',
  },
  indigo: {
    bg100: 'bg-indigo-100',
    text500: 'text-indigo-500',
    text600: 'text-indigo-600',
  },
  teal: {
    bg100: 'bg-teal-100',
    text500: 'text-teal-500',
    text600: 'text-teal-600',
  },
  amber: {
    bg100: 'bg-amber-100',
    text500: 'text-amber-500',
    text600: 'text-amber-600',
  },
  emerald: {
    bg100: 'bg-emerald-100',
    text500: 'text-emerald-500',
    text600: 'text-emerald-600',
  },
  violet: {
    bg100: 'bg-violet-100',
    text500: 'text-violet-500',
    text600: 'text-violet-600',
  },
};

/**
 * 获取指定颜色的类名
 * @param color 颜色名称
 * @returns 包含 bg100、text500、text600 的类名对象
 */
export function getColorClasses(color: ColorName): ColorClasses {
  return colorMap[color] || colorMap.blue; // 默认使用蓝色
}

/**
 * 获取背景色类名
 * @param color 颜色名称
 * @returns Tailwind 背景色类名
 */
export function getBgClass(color: ColorName): string {
  return getColorClasses(color).bg100;
}

/**
 * 获取文本色类名（浅色，用于图标/大字）
 * @param color 颜色名称
 * @returns Tailwind 文本色类名
 */
export function getTextClass(color: ColorName): string {
  return getColorClasses(color).text500;
}

/**
 * 获取文本色类名（深色，用于强调）
 * @param color 颜色名称
 * @returns Tailwind 文本色类名
 */
export function getTextDarkClass(color: ColorName): string {
  return getColorClasses(color).text600;
}
