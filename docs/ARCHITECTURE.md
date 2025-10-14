# 架构与目录（Architecture）

本项目的桌面端架构参考 /Users/wushaobing911/Desktop/opcode：Tauri 2 + React + TypeScript + Vite + Tailwind + Zustand。

## 总体架构

- UI 前端：React 18 + TS + Tailwind
- 桌面容器：Tauri 2（Rust 后端，WebView 前端）
- 状态管理：Zustand（分数、进度、卡片状态）
- 构建与开发：Vite 6（固定端口 1420；HMR 使用 1421）
- 插件：@tauri-apps/plugin-shell（语音兜底）、@tauri-apps/plugin-dialog（可选）

## 目录建议

```
zrpd/
├── src/                     # React 源码
│   ├── components/          # UI 组件（Card、Grids、Scoreboard 等）
│   ├── features/            # 领域模块（vowels、consonants、game）
│   ├── hooks/               # 自定义 Hook（useSpeech、useVisibility、useProgress）
│   ├── stores/              # Zustand stores（scoreStore、progressStore）
│   ├── assets/              # 本地静态资源（icons、audio、images）
│   ├── data/                # 规则与词表 JSON（元音/辅音/组合/音标）
│   ├── styles/              # 全局样式与 Tailwind 配置
│   └── main.tsx             # 入口
├── src-tauri/               # Tauri（Rust）
│   ├── src/
│   │   ├── commands/        # 自定义命令（如语音兜底）
│   │   └── lib/             # 工具
│   └── tauri.conf.json      # Tauri 配置（端口、权限、插件）
├── index.html               # Vite HTML（仅挂载点，移除 CDN）
├── vite.config.ts           # 端口/HMR/rollup manualChunks 对齐 opcode
└── package.json
```

## 从 HTML 到组件的映射

基于 /Users/wushaobing911/Desktop/zrpd/自然拼读.html：

- IntroSection（欢迎区）
- VowelsSection（元音卡片 A/E/I/O/U：发音+示例+播报按钮）
- ConsonantsSection（辅音表格）
- GameSection（字母组合配对卡片网格：翻转+得分+重置+洗牌）
- PhoneticsSection（国际音标小课堂）
- AchievementSection（学习成果：分数、掌握字母）
- RulesAccordion（规则总览：details/summary）
- AppHeader（顶部进度条与标题）
- AppFooter（社交链接）

## 状态与通信

- scoreStore：分数 number；addScore(points)
- progressStore：滚动进度百分比；更新于 scroll 事件或路由切换
- gameStore：卡片初始顺序、翻转状态、是否计分（scored 标记）

## 语音策略（优先级）

1. Web Speech API（SpeechSynthesisUtterance）
2. Tauri Shell 调用系统 say（macOS）
3. 预置本地音频（assets/audio/en-US/...）

## 性能与构建拆包

- Vite rollupOptions.output.manualChunks：对齐 opcode：
  - react-vendor：['react','react-dom']
  - ui-vendor：Radix 组件
  - tauri：['@tauri-apps/api','@tauri-apps/plugin-shell']
  - utils：['date-fns','clsx','tailwind-merge']
- 首屏：路由/组件级懒加载；卡片网格虚拟化（可选 @tanstack/react-virtual）

## 离线与资源

- 去除 CDN，使用本地 npm 依赖与打包资源
- 音频放置于 assets/audio，打包进入应用
- 字体与图标：优先使用本地 icon 字体或 SVG

## 可访问性

- 所有交互元素具备 role/aria-label/tabIndex
- 键盘：Space/Enter 触发翻转；焦点样式可见
- Reduced Motion：尊重 prefers-reduced-motion
