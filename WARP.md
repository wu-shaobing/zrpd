# Project Rules: 自然拼读桌面小游戏

## 项目概述
自然拼读（Phonics）桌面小游戏，用于儿童英语拼读学习的互动应用。

## 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 4（本地依赖，无CDN）
- **状态管理**: Zustand
- **桌面封装**: Tauri 2（后期集成）
- **图标**: lucide-react（替代 Font Awesome）

## Agent Guidelines

### 核心约束
1. **端口固定**: Vite 开发端口 `1420`（strictPort: true），HMR 端口 `1421`
2. **离线优先**: 所有依赖必须本地打包，禁止CDN引用
3. **代码质量**: 所有变更以可审查的最小 diff 提交，保持代码可运行
4. **可访问性**: 遵循 WCAG 2.1 标准，支持键盘导航与屏幕阅读器
5. **性能**: 组件按需加载，避免不必要的重渲染

### 开发规范
- 组件按功能模块组织（features/vowels, features/game 等）
- 数据文件统一放置于 `src/data`，类型定义参考 `docs/DATA_MODEL.md`
- Zustand Store 按职责拆分：score、progress、game
- 样式优先使用 Tailwind utility classes，全局样式放 `src/styles`
- 支持 `prefers-reduced-motion` 媒体查询

### 安全策略
- Tauri Shell allowlist 仅精确到 `/usr/bin/say`（macOS 语音）
- 输入文本长度限制（≤200字符）与字符过滤
- 不收集用户数据，无遥测

### 语音策略（优先级）
1. **Web Speech API**（优先）: SpeechSynthesisUtterance，语言 en-US/en-GB
2. **Tauri Shell**（兜底）: macOS `say` 命令（需 allowlist）
3. **本地音频**（终极兜底）: 预置 mp3 素材

## MVP 范围（当前阶段）

### 必做功能
- [x] 首页结构与滚动进度条
- [x] 元音卡片区（A/E/I/O/U + 音标 + 示例 + 播放）
- [x] 辅音卡片区（精简子集）
- [x] 字母组合游戏（4张翻卡：ea/ow/ch/th）
- [x] 学习成果（分数展示 + 已掌握字母）
- [x] 键盘可达性（Tab、Enter/Space 翻卡）
- [x] 基本 ARIA 标注

### 非必做（后置）
- [ ] 全量48音标课程
- [ ] 完整规则集展开
- [ ] 音频素材库
- [ ] 自动更新
- [ ] 跨平台安装包
- [ ] 深度国际化

## 目录结构
```
zrpd/
├── src/
│   ├── components/       # 通用UI组件
│   ├── features/         # 功能模块（vowels、consonants、game）
│   ├── stores/           # Zustand stores
│   ├── hooks/            # 自定义 Hooks
│   ├── data/             # JSON 数据文件
│   ├── styles/           # 全局样式
│   ├── App.tsx           # 主应用入口
│   └── main.tsx          # React 挂载点
├── src-tauri/            # Tauri 配置（后期）
├── docs/                 # 设计文档
├── index.html            # HTML 挂载点
├── vite.config.ts        # Vite 配置（端口1420/1421）
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 依赖清单
```

## Slash Commands

### /init
初始化项目基础设施
- 创建 Git 仓库
- 生成 package.json、vite.config.ts、tsconfig.json
- 安装依赖：react、vite、tailwindcss、zustand
- 创建目录结构

### /scaffold
生成组件骨架
- 从 `docs/自然拼读.html` 提取结构
- 创建 React 组件（Vowels、Game、Header 等）
- 抽离数据到 JSON 文件

### /mvp
实现 MVP 最小功能集
- 实现 4 张翻卡游戏（首翻计分、重置/洗牌）
- 实现元音卡片播放（Web Speech）
- 实现进度条与键盘可达性

### /test
运行基础检查
- TypeScript 类型检查
- 构建验证（npm run build）
- 手工验收清单输出

### /tauri
集成 Tauri 2
- 安装 @tauri-apps/cli 与相关插件
- 配置 tauri.conf.json（端口、权限、allowlist）
- 添加 Rust 后端命令（语音兜底）

## 验收标准

### 功能验收
- [ ] 离线可运行（无CDN依赖）
- [ ] 翻卡首次计分，重置后状态清零
- [ ] 进度条随滚动实时更新
- [ ] Web Speech 可用环境下语音正常
- [ ] 键盘 Tab 导航，Enter/Space 触发翻卡
- [ ] Reduced Motion 模式下动画禁用

### 性能验收
- [ ] 首屏加载 < 2s（本地开发）
- [ ] 交互响应 < 100ms

### 无障碍验收
- [ ] 焦点可见（focus-visible 样式）
- [ ] ARIA 标签完整（role、aria-label）
- [ ] 对比度 ≥ 4.5:1

## 参考资源
- 原型: `docs/自然拼读.html`
- 架构: `docs/ARCHITECTURE.md`
- 数据模型: `docs/DATA_MODEL.md`
- Tauri 集成: `docs/TAURI_INTEGRATION.md`
- 玩法设计: `docs/GAMEPLAY_DESIGN.md`

## 开发流程
1. **本地前端开发**: `npm run dev` → http://localhost:1420
2. **Tauri 调试**（后期）: `npm run tauri dev`
3. **生产构建**: `npm run build`
4. **Tauri 打包**（后期）: `npm run tauri build`

## 注意事项
- 修改端口前必须确认无冲突（lsof -i :1420）
- Tauri 集成前先确保前端功能完备可测
- 语音功能需在 HTTPS 或 localhost 环境
- macOS 打包需 Xcode Command Line Tools
