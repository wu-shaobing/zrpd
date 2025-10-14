# 自然拼读小课堂 - 功能展示

**应用地址**: http://localhost:1420  
**技术栈**: React 18 + Vite 6 + Tailwind CSS 4 + Zustand  
**状态**: ✅ 开发服务器运行中

---

## 🎯 核心功能概览

### 1️⃣ 元音字母学习模块

**功能描述**: 交互式元音字母学习卡片，支持语音播放

**关键特性**:
- 5 个元音字母 (A, E, I, O, U)
- 独特颜色标识系统
- 国际音标 (IPA) 显示
- 示例单词展示
- Web Speech API 语音播放
- 悬停动画效果

**代码实现**:

<augment_code_snippet path="src/features/vowels/VowelsSection.tsx" mode="EXCERPT">
````tsx
export function VowelsSection() {
  const { speak } = useSpeech();
  
  return (
    <section className="section mb-16" id="vowels">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {vowelsData.map((vowel) => {
          const colors = getColorClasses(vowel.color as ColorName);
          return (
            <div key={vowel.letter} className="letter-card">
              <button onClick={() => speak(vowel.examples.join(', '))}>
                听发音
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
````
</augment_code_snippet>

**数据结构**:

<augment_code_snippet path="src/data/vowels.json" mode="EXCERPT">
````json
[
  {
    "letter": "A",
    "color": "red",
    "ipa": "/æ/",
    "examples": ["bag", "map"]
  }
]
````
</augment_code_snippet>

---

### 2️⃣ 辅音字母学习模块

**功能描述**: 展示辅音字母及其发音规则

**关键特性**:
- 13 个常用辅音字母
- 多发音支持 (如 C: /k/ /s/)
- 响应式网格布局 (3/5/7 列)
- 颜色编码系统

**代码实现**:

<augment_code_snippet path="src/features/consonants/ConsonantsSection.tsx" mode="EXCERPT">
````tsx
export function ConsonantsSection() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
      {consonantsData.map((consonant) => {
        const colors = getColorClasses(consonant.color as ColorName);
        return (
          <div key={consonant.letter} className="letter-card">
            <span className={colors.text500}>{consonant.letter}</span>
            <p>{consonant.ipa}</p>
          </div>
        );
      })}
    </div>
  );
}
````
</augment_code_snippet>

---

### 3️⃣ 翻卡游戏系统

**功能描述**: 互动翻卡游戏，支持计分和重置

**关键特性**:
- 4 张游戏卡片 (ea, ow, ch, th)
- 3D 翻转动画 (CSS transform)
- 首次翻转加分机制
- 防重复计分逻辑
- 卡片洗牌功能
- 键盘操作支持

**代码实现**:

<augment_code_snippet path="src/features/game/GameCard.tsx" mode="EXCERPT">
````tsx
export function GameCard({ card, flipped, scored }: GameCardProps) {
  const { flipCard, markScored } = useGameStore();
  const addScore = useScoreStore((state) => state.addScore);

  const handleClick = () => {
    flipCard(card.id);
    
    // 首次翻转加分
    if (!flipped && !scored) {
      addScore(card.points);
      markScored(card.id);
    }
  };

  return (
    <div 
      className={`game-card ${flipped ? 'flipped' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 卡片内容 */}
    </div>
  );
}
````
</augment_code_snippet>

**状态管理**:

<augment_code_snippet path="src/stores/gameStore.ts" mode="EXCERPT">
````tsx
export const useGameStore = create<GameState>((set) => ({
  cards: [],
  flipCard: (id) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, flipped: !card.flipped } : card
      ),
    })),
  resetGame: () =>
    set((state) => ({
      cards: state.cards.map((card) => ({
        ...card,
        flipped: false,
        scored: false,
      })),
    })),
  shuffleCards: () =>
    set((state) => ({
      cards: [...state.cards].sort(() => Math.random() - 0.5),
    })),
}));
````
</augment_code_snippet>

---

### 4️⃣ 语音播放系统

**功能描述**: Web Speech API 集成，支持英语发音

**关键特性**:
- 自动选择英语语音 (en-US/en-GB)
- 语速和音调调整
- 错误处理和降级
- 浏览器兼容性检测

**代码实现**:

<augment_code_snippet path="src/hooks/useSpeech.ts" mode="EXCERPT">
````tsx
export function useSpeech() {
  const canWebSpeech = 'speechSynthesis' in window;

  const speak = useCallback((text: string) => {
    if (!text?.trim()) return;

    if (canWebSpeech) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find((v) =>
          /en-(US|GB)/i.test(v.lang)
        );
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Speech synthesis failed:', error);
      }
    }
  }, [canWebSpeech]);

  return { speak, canWebSpeech };
}
````
</augment_code_snippet>

---

### 5️⃣ 滚动进度条

**功能描述**: 实时显示页面滚动进度

**关键特性**:
- 固定顶部导航栏
- 实时进度计算 (0-100%)
- 平滑过渡动画
- 百分比数字显示
- ARIA 无障碍支持

**代码实现**:

<augment_code_snippet path="src/hooks/useProgress.ts" mode="EXCERPT">
````tsx
export function useProgress() {
  const setPercent = useProgressStore((state) => state.setPercent);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setPercent(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setPercent]);
}
````
</augment_code_snippet>

<augment_code_snippet path="src/components/Header.tsx" mode="EXCERPT">
````tsx
export function Header() {
  const percent = useProgressStore((state) => state.percent);

  return (
    <header className="sticky top-0 z-50">
      <div className="w-32 h-2 bg-gray-200/30 rounded-full">
        <div
          className="progress-fill h-full"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percent)}
        />
      </div>
      <span aria-live="polite">{Math.round(percent)}%</span>
    </header>
  );
}
````
</augment_code_snippet>

---

### 6️⃣ 成就系统

**功能描述**: 展示学习成果和总分数

**关键特性**:
- 实时分数显示
- 已掌握字母追踪
- 成就徽章系统（待实现）
- 小测验入口（待实现）

**代码实现**:

<augment_code_snippet path="src/features/game/AchievementSection.tsx" mode="EXCERPT">
````tsx
export function AchievementSection() {
  const score = useScoreStore((state) => state.score);
  
  return (
    <section id="achievement">
      <div className="w-32 h-32 bg-indigo-50 rounded-full">
        <span id="score" aria-live="polite">
          {score}
        </span>
        <span>分</span>
      </div>
    </section>
  );
}
````
</augment_code_snippet>

---

## 🎨 设计系统

### 颜色映射工具

**问题**: Tailwind JIT 无法识别动态拼接的类名  
**解决方案**: 静态颜色映射表

<augment_code_snippet path="src/utils/colors.ts" mode="EXCERPT">
````tsx
const colorMap: Record<ColorName, ColorClasses> = {
  red: {
    bg100: 'bg-red-100',
    text500: 'text-red-500',
    text600: 'text-red-600',
  },
  // ... 其他颜色
};

export function getColorClasses(color: ColorName): ColorClasses {
  return colorMap[color] || colorMap.blue;
}
````
</augment_code_snippet>

**使用示例**:
```tsx
const colors = getColorClasses('red');
<div className={`${colors.bg100} ${colors.text500}`}>A</div>
```

---

### 动画系统

**CSS 动画**:

<augment_code_snippet path="src/styles/global.css" mode="EXCERPT">
````css
/* 卡片悬停动画 */
.letter-card {
  transition: all 0.3s ease;
}

.letter-card:hover {
  transform: translateY(-5px);
}

/* 翻卡 3D 动画 */
.game-card {
  transition: all 0.2s ease;
  transform-style: preserve-3d;
}

.game-card.flipped {
  transform: rotateY(180deg);
}

/* 浮动动画 */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.floating {
  animation: float 3s ease-in-out infinite;
}
````
</augment_code_snippet>

---

## ♿ 无障碍特性

### ARIA 标签

**语义化 HTML**:
```tsx
<section aria-labelledby="vowels-title">
  <h2 id="vowels-title">元音字母发音</h2>
</section>

<button aria-label="播放 A 发音示例">
  听发音
</button>

<div 
  role="button"
  tabIndex={0}
  aria-label="字母组合 ea 卡片，按空格翻转"
>
  {/* 游戏卡片 */}
</div>
```

### 键盘导航

**焦点管理**:
```css
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

**键盘事件处理**:
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    handleClick();
  }
};
```

### Reduced Motion

**动画降级**:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 📱 响应式设计

### 断点系统

**Tailwind 断点**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**响应式网格**:
```tsx
// 元音字母: 2 → 3 → 5 列
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

// 辅音字母: 3 → 5 → 7 列
<div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">

// 游戏卡片: 2 → 3 → 4 列
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

---

## 🚀 性能优化

### 代码分割

<augment_code_snippet path="vite.config.ts" mode="EXCERPT">
````ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'zustand-vendor': ['zustand'],
        },
      },
    },
  },
});
````
</augment_code_snippet>

### 懒加载

**Intersection Observer**:
```tsx
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => observer.observe(section));

  return () => observer.disconnect();
}, []);
```

---

## 🧪 测试场景

### 功能测试

**元音字母语音播放**:
```bash
1. 打开应用
2. 滚动到元音字母部分
3. 点击 A 字母的"听发音"按钮
4. 预期: 听到 "bag, map" 的英语发音
5. 检查控制台无错误
```

**翻卡游戏计分**:
```bash
1. 滚动到游戏部分
2. 点击第一张卡片
3. 预期: 卡片翻转，分数 +5
4. 再次点击同一卡片
5. 预期: 卡片翻回，分数不变
6. 点击"重置游戏"
7. 预期: 所有卡片恢复，分数归零
```

### 边界测试

**快速点击**:
```bash
1. 快速连续点击同一张卡片 10 次
2. 预期: 动画流畅，分数只增加一次
```

**语音播放失败**:
```bash
1. 在不支持 Web Speech API 的浏览器中打开
2. 点击"听发音"按钮
3. 预期: 控制台显示警告，应用不崩溃
```

---

## 📊 性能指标

### Lighthouse 目标

- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 80

### 关键指标

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🔮 未来功能

### 待实现

1. **完整音标课程**: 扩展到所有字母和字母组合
2. **小测验系统**: 互动测验和评分
3. **学习进度追踪**: LocalStorage 持久化
4. **成就徽章**: 解锁系统和奖励
5. **Tauri 集成**: 桌面应用打包
6. **语音降级**: Tauri Shell 或本地音频

### 技术债务

1. 添加单元测试 (Vitest)
2. 添加 E2E 测试 (Playwright)
3. 错误边界 (Error Boundary)
4. 性能监控 (Web Vitals)
5. 国际化 (i18n)

---

**文档维护**: Augment Agent  
**最后更新**: 2025-10-14  
**版本**: 1.0

