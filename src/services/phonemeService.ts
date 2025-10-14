/**
 * 音标数据服务
 * 负责加载、管理和查询48音标数据
 */

import type {
  Phoneme,
  PhonicsData,
  LearningLevel,
  PhonemeCategory,
  DifficultyLevel,
} from '../types/phoneme';
import phonicsCompleteData from '../data/phonics-complete.json';

class PhonemeService {
  private data: PhonicsData;
  private phonemeMap: Map<string, Phoneme>;
  private phonemesByCategory: Map<PhonemeCategory, Phoneme[]>;

  constructor() {
    this.data = phonicsCompleteData as PhonicsData;
    this.phonemeMap = new Map();
    this.phonemesByCategory = new Map();
    this.initializeMaps();
  }

  /**
   * 初始化音标映射表
   */
  private initializeMaps(): void {
    // 收集所有音标
    const allPhonemes: Phoneme[] = [
      ...this.data.vowels.monophthongs.short,
      ...this.data.vowels.monophthongs.long,
      ...this.data.vowels.diphthongs,
      ...this.data.consonants.plosives,
      ...this.data.consonants.fricatives,
      ...this.data.consonants.affricates,
      ...this.data.consonants.nasals,
      ...this.data.consonants.liquids,
      ...this.data.consonants.glides,
      ...this.data.consonants.others,
    ];

    // 建立ID映射
    allPhonemes.forEach((phoneme) => {
      this.phonemeMap.set(phoneme.id, phoneme);
    });

    // 建立分类映射（按照category字段分组）
    const categoryMap = new Map<PhonemeCategory, Phoneme[]>();
    allPhonemes.forEach((phoneme) => {
      const category = phoneme.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(phoneme);
    });
    
    this.phonemesByCategory = categoryMap;
  }

  /**
   * 获取所有音标
   */
  getAllPhonemes(): Phoneme[] {
    return Array.from(this.phonemeMap.values());
  }

  /**
   * 根据ID获取音标
   */
  getPhonemeById(id: string): Phoneme | undefined {
    return this.phonemeMap.get(id);
  }

  /**
   * 根据类别获取音标
   */
  getPhonemesByCategory(category: PhonemeCategory): Phoneme[] {
    return this.phonemesByCategory.get(category) || [];
  }

  /**
   * 获取所有元音
   */
  getAllVowels(): Phoneme[] {
    return [
      ...this.data.vowels.monophthongs.short,
      ...this.data.vowels.monophthongs.long,
      ...this.data.vowels.diphthongs,
    ];
  }

  /**
   * 获取所有辅音
   */
  getAllConsonants(): Phoneme[] {
    return [
      ...this.data.consonants.plosives,
      ...this.data.consonants.fricatives,
      ...this.data.consonants.affricates,
      ...this.data.consonants.nasals,
      ...this.data.consonants.liquids,
      ...this.data.consonants.glides,
      ...this.data.consonants.others,
    ];
  }

  /**
   * 根据难度获取音标
   */
  getPhonemesByDifficulty(difficulty: DifficultyLevel): Phoneme[] {
    return this.getAllPhonemes().filter((p) => p.difficulty === difficulty);
  }

  /**
   * 根据学习级别获取音标
   */
  getPhonemesByLevel(level: number): Phoneme[] {
    return this.getAllPhonemes().filter((p) => p.level === level);
  }

  /**
   * 搜索音标（根据名称或符号）
   */
  searchPhonemes(query: string): Phoneme[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPhonemes().filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.symbol.includes(lowerQuery)
    );
  }

  /**
   * 获取学习级别信息
   */
  getLevels(): LearningLevel[] {
    return this.data.levels;
  }

  /**
   * 获取元数据
   */
  getMetadata() {
    return this.data.metadata;
  }

  /**
   * 获取推荐学习音标（基于用户进度）
   */
  getRecommendedPhonemes(
    completedIds: string[],
    count: number = 5
  ): Phoneme[] {
    const incomplete = this.getAllPhonemes().filter(
      (p) => !completedIds.includes(p.id)
    );

    // 按难度和级别排序
    incomplete.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.difficulty - b.difficulty;
    });

    return incomplete.slice(0, count);
  }

  /**
   * 获取相似音标（用于对比练习）
   */
  getSimilarPhonemes(phonemeId: string): Phoneme[] {
    const phoneme = this.getPhonemeById(phonemeId);
    if (!phoneme) return [];

    // 返回同类别且难度相近的音标
    return this.getPhonemesByCategory(phoneme.category).filter(
      (p) => p.id !== phonemeId && Math.abs(p.difficulty - phoneme.difficulty) <= 1
    );
  }

  /**
   * 获取随机音标（用于游戏）
   */
  getRandomPhonemes(count: number, options?: {
    category?: PhonemeCategory;
    difficulty?: DifficultyLevel;
    level?: number;
  }): Phoneme[] {
    let pool = this.getAllPhonemes();

    if (options?.category) {
      pool = this.getPhonemesByCategory(options.category);
    }
    if (options?.difficulty) {
      pool = pool.filter((p) => p.difficulty === options.difficulty);
    }
    if (options?.level) {
      pool = pool.filter((p) => p.level === options.level);
    }

    // Fisher-Yates 洗牌算法
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}

// 创建单例实例
export const phonemeService = new PhonemeService();

// 导出类型以便测试
export type { PhonemeService };
