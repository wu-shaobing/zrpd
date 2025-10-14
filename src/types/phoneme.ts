/**
 * 音标类型定义
 * 完整的48音标系统类型系统
 */

// 音标类别
export type PhonemeCategory =
  | 'short_vowel'      // 短元音
  | 'long_vowel'       // 长元音
  | 'neutral_vowel'    // 中性元音
  | 'diphthong'        // 双元音
  | 'plosive'          // 爆破音
  | 'fricative'        // 摩擦音
  | 'affricate'        // 破擦音
  | 'nasal'            // 鼻音
  | 'approximant'      // 近音
  | 'cluster'          // 辅音组合
  | 'consonant';       // 通用辅音

// 难度等级
export type DifficultyLevel = 1 | 2 | 3;

// 发音指导（支持元音和辅音两种结构）
export interface Pronunciation {
  cn: string;                 // 中文描述
  tips: string;               // 发音技巧
  // 元音特有字段
  mouthShape?: string;        // 嘴型
  tonguePosition?: string;    // 舌位
  // 辅音特有字段
  articulationPoint?: string; // 发音部位
  manner?: string;            // 发音方式
}

// 单词示例
export interface Example {
  word: string;               // 单词
  translation: string;        // 翻译
  phonetic: string;           // 音标
  audio?: string;             // 音频文件名
}

// 音标数据结构
export interface Phoneme {
  id: string;                 // 唯一标识
  symbol: string;             // 音标符号
  name: string;               // 名称
  level: number;              // 学习级别 (1-3)
  category: PhonemeCategory;  // 类别
  pronunciation: Pronunciation; // 发音指导
  examples: Example[];        // 示例单词
  commonMistakes: string[];   // 常见错误
  practiceWords: string[];    // 练习单词
  difficulty: DifficultyLevel; // 难度
}

// 学习级别定义
export interface LearningLevel {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  requiredScore: number;
}

// 音标数据元数据
export interface PhonicsMetadata {
  version: string;
  lastUpdated: string;
  totalPhonemes: number;
  categories: {
    vowels: {
      monophthongs: number;
      diphthongs: number;
    };
    consonants: number;
  };
}

// 元音分类
export interface VowelPhonemes {
  monophthongs: {
    short: Phoneme[];
    long: Phoneme[];
  };
  diphthongs: Phoneme[];
}

// 辅音分类（按照实际JSON结构）
export interface ConsonantPhonemes {
  plosives: Phoneme[];        // 爆破音
  fricatives: Phoneme[];      // 摩擦音
  affricates: Phoneme[];      // 破擦音
  nasals: Phoneme[];          // 鼻音
  liquids: Phoneme[];         // 流音
  glides: Phoneme[];          // 滑音/近音
  others: Phoneme[];          // 其他（组合）
}

// 完整音标数据
export interface PhonicsData {
  metadata: PhonicsMetadata;
  levels: LearningLevel[];
  vowels: VowelPhonemes;
  consonants: ConsonantPhonemes;
}

// 用户学习进度
export interface PhonemeProgress {
  phonemeId: string;
  masteryLevel: number;       // 掌握程度 0-100
  practiceCount: number;      // 练习次数
  correctCount: number;       // 正确次数
  lastPracticed: string;      // 最后练习时间
  isFavorite: boolean;        // 是否收藏
}

// 学习统计
export interface LearningStats {
  totalPhonemes: number;
  masteredPhonemes: number;
  inProgressPhonemes: number;
  totalPracticeTime: number;  // 分钟
  currentStreak: number;      // 连续天数
}

// 游戏模式类型
export type GameMode =
  | 'flip_card'               // 翻卡游戏
  | 'listen_select'           // 听音选择
  | 'word_spelling'           // 单词拼音
  | 'minimal_pair';           // 最小对立组

// 游戏配置
export interface GameConfig {
  mode: GameMode;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  phonemeIds: string[];
  timeLimit?: number;         // 秒
  targetScore: number;
}
