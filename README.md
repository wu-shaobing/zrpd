# 自然拼读桌面小游戏 - 开发文档总览

本文档集合基于 /Users/wushaobing911/Desktop/opcode 的桌面应用开发逻辑（Tauri 2 + React + Vite + Tailwind），为"自然拼读小课堂"桌面小游戏提供完整的多文件开发说明。页面与交互以 /Users/wushaobing911/Desktop/zrpd/自然拼读.html 为优先信息来源，并结合 GitHub 上相似项目与最佳实践。

## 技术栈概览

- **目标平台**：macOS（可扩展到 Windows/Linux）
- **技术栈**：Tauri 2（Rust 后端）+ React 18 + TypeScript + Vite 6 + Tailwind CSS 4 + Zustand
- **离线可用**：将 CDN 资源（Tailwind、Font Awesome）替换为本地依赖打包
- **语音功能**：三层音频架构
  1. **本地音频 Sprite**（首选）- 使用 Web Audio API 播放预置音频
  2. **Tauri Shell TTS**（兜底1）- macOS `say` 命令（受限 allowlist）
  3. **Web Speech API**（兜底2）- 浏览器内置 TTS

## 文档导航

### 核心文档
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)：架构与目录
- [ENVIRONMENT_AND_SETUP.md](./docs/ENVIRONMENT_AND_SETUP.md)：环境与初始化
- [BUILD_AND_RUN.md](./docs/BUILD_AND_RUN.md)：开发运行与打包
- [GAMEPLAY_DESIGN.md](./docs/GAMEPLAY_DESIGN.md)：玩法设计与交互
- [ASSETS_AND_CONTENT.md](./docs/ASSETS_AND_CONTENT.md)：素材与内容数据
- [TESTING_AND_QA.md](./docs/TESTING_AND_QA.md)：测试与验收

### 技术文档
- [TAURI_INTEGRATION.md](./docs/TAURI_INTEGRATION.md)：Tauri 集成要点（插件、权限、安全）
- [ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)：无障碍与可访问性
- [I18N_AND_L10N.md](./docs/I18N_AND_L10N.md)：国际化本地化
- [SECURITY.md](./docs/SECURITY.md)：安全与隐私
- [DATA_MODEL.md](./docs/DATA_MODEL.md)：数据模型与类型
- [REFERENCES.md](./docs/REFERENCES.md)：外部参考与链接

### 🎵 音频系统文档（新增）
- **[AUDIO_QUICKSTART.md](./docs/AUDIO_QUICKSTART.md)** - ⚡ 5分钟快速开始
- **[AUDIO_SYSTEM.md](./docs/AUDIO_SYSTEM.md)** - 📚 完整架构文档（450+ 行）
- **[scripts/README.md](./scripts/README.md)** - 🛠️ 音频生成脚本说明

## 快速开始

### 🚀 一键启动（推荐）

**macOS 用户**：双击 `start.command` 文件即可启动项目！

```bash
# 或在终端运行
./start.command
```

**Linux/Windows 用户**：
```bash
./start.sh
# 或
npm run dev
```

`start.command` 会自动完成以下操作：
- ✅ 检查 Node.js 环境
- ✅ 自动安装/更新依赖
- ✅ 检查并释放端口 1420
- ✅ 启动开发服务器
- ✅ 3秒后自动打开浏览器

### 📋 完整流程（摘要）

1) **安装依赖**：Rust、Node/Bun、Tauri CLI、Xcode CLT（macOS）
2) **初始化项目**：Vite + React + TS + Tailwind；加入 Tauri 2（对齐端口 1420）
3) **迁移页面**：将 自然拼读.html 切分为 React 组件；引入 Zustand 管理分数与进度
4) **语音兜底**：实现 useSpeech hook（Web Speech → Tauri Shell → 音频文件）
5) **运行调试**：bun run tauri dev（或 npm/yarn/pnpm 等价命令）
6) **打包发布**：bun run tauri build（生成 .dmg/.msi/.AppImage）

## 与 opcode 的一致性

- **开发端口与 HMR**：固定 1420，严格端口；HMR 使用 1421（见 Vite 配置）
- **构建拆包**：手动 vendor 分包（react-vendor、ui-vendor、tauri 等），优化首屏
- **Tauri 插件**：按需启用 @tauri-apps/plugin-shell（语音兜底）、dialog、opener 等
- **安全策略**：严格 allowlist；禁用不必要系统调用；本地数据存储

## 外部参考项目

基于 GitHub API 检索，以下项目提供了相关实现参考：

### 自然拼读类项目
- **[hellodeborahuk/buzzphonics](https://github.com/hellodeborahuk/buzzphonics)** (51⭐) - React 实现的英语 Phase 2/3 自然拼读应用
- **[JefeThePug/PhonicsBlast](https://github.com/JefeThePug/PhonicsBlast)** - p5.js 实现的拼读游戏

### Tauri + React + Vite 模板
- **[elibroftw/modern-desktop-app-template](https://github.com/elibroftw/modern-desktop-app-template)** (275⭐) - Tauri v2 & React v19 现代桌面应用模板
- **[MrLightful/create-tauri-react](https://github.com/MrLightful/create-tauri-react)** (65⭐) - Tauri + Vite + React + Tailwind CSS 架构良好的模板

## 注意事项

- 本文档落地到 `/Users/wushaobing911/Desktop/zrpd/docs` 目录
- 后续如需 CI/CD、代码签名或跨平台差异配置，请在相应文档中扩展
- 原 HTML 文件中的交互逻辑（卡片翻转、进度追踪、语音播放）将完全复制到 React 组件中

## 🎵 音频系统（新增）

### 三层语音架构

项目采用**三层降级策略**，确保音素发音的一致性和稳定性：

```
本地音频 Sprite (首选) → Tauri TTS (兜底1) → Web Speech API (兜底2)
```

### 快速启用音频

```bash
# 1. 安装音频生成工具（可选，用于生成高质量音频）
brew install espeak-ng ffmpeg sox jq
npm install -g audiosprite

# 2. 生成音频资产
./scripts/generate-phonemes.sh

# 3. 启动应用（即使不生成音频，应用也能正常运行）
npm run dev
```

### 特性

- ✅ **离线优先** - 本地音频文件，无需网络
- ✅ **自动降级** - 三层策略确保任何环境可用
- ✅ **高性能** - 懒加载、预加载、淡入淡出
- ✅ **无障碍** - ARIA 标签、键盘可达
- ✅ **可定制** - 调整 eSpeak 参数或手动替换音素

### 使用示例

```tsx
import { usePhonemeAudio } from '@/hooks/usePhonemeAudio';

function MyComponent() {
  const { play, isPlaying } = usePhonemeAudio();
  
  return (
    <button onClick={() => play('v1')} disabled={isPlaying}>
      {isPlaying ? '播放中...' : '听发音'}
    </button>
  );
}
```

详见 [AUDIO_QUICKSTART.md](./docs/AUDIO_QUICKSTART.md)

---

## 开发优先级

1. **核心功能**：元音字母学习、辅音字母学习、字母组合游戏
2. **交互功能**：卡片翻转动画、进度条更新、分数统计
3. **增强功能**：✅ 音频播放系统、键盘导航、无障碍支持
4. **包装功能**：桌面应用集成、本地化、主题切换
