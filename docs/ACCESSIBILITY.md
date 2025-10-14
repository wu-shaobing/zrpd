# 无障碍与可访问性（Accessibility）

## 语义与 ARIA

- sections 对应语义标签与 `aria-labelledby`
- 交互按钮具备 `aria-label`，状态通过 `aria-pressed`/`aria-expanded` 表达

## 键盘导航

- 卡片 `tabIndex=0`，Enter/Space 翻转
- 焦点环样式可见（Tailwind focus-visible）

## 动画与动效

- 尊重 `prefers-reduced-motion: reduce`
- 避免闪烁/高频动画

## 颜色与对比度

- 主/辅/强调色对比度 ≥ 4.5:1（文本）
- 提供高对比度主题（可选）

## 屏幕阅读器

- 分数变更区域 `aria-live="polite"`
- 进度百分比文本同步更新
