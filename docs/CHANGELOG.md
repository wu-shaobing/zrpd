# 更新日志 (Changelog)

## [Unreleased] - 2025-10-16

### ✨ 新增功能

#### 🎵 三层音频语音架构

实现了完整的音素音频播放系统，采用三层降级策略：

1. **本地音频 Sprite** (首选)
   - 使用 Web Audio API 播放预置音频
   - 支持淡入淡出，消除点击声
   - 延迟最低（~10ms）

2. **Tauri TTS** (兜底1)
   - macOS `say` 命令
   - 使用载体音节技巧

3. **Web Speech API** (兜底2)
   - 浏览器内置 TTS
   - 全平台兼容

#### 📦 新增文件

- `src/types/phoneme-audio.ts` - 音频系统类型定义
- `src/hooks/usePhonemeAudio.ts` - React Hook 封装
- `src/data/phoneme-audio-config.json` - 48音素配置
- `scripts/generate-phonemes.sh` - 音频生成脚本
- `public/assets/audio/` - 音频资产目录
- `docs/AUDIO_SYSTEM.md` - 完整架构文档
- `docs/AUDIO_QUICKSTART.md` - 快速开始指南
- `scripts/README.md` - 脚本使用说明

### 🔄 变更

- **PhonemeCard 组件**
  - 从 `useSpeech` 迁移到 `usePhonemeAudio`
  - 添加播放状态 UI（禁用按钮、动画图标）
  - 显示播放中状态

- **App 组件**
  - 添加音频预加载（延迟1秒启动）
  - 优化首次播放体验

### ⚠️ 废弃

- `src/hooks/useSpeech.ts` - 标记为 `@deprecated`
  - 功能仍然可用（向后兼容）
  - 建议迁移到 `usePhonemeAudio`
  - 将在未来版本移除

### 📚 文档

- ✅ 完整架构文档（450+ 行）
- ✅ 5分钟快速开始指南
- ✅ 脚本详细使用说明
- ✅ 故障排查指南
- ✅ 性能优化建议

### 🛠️ 技术栈更新

- 新增依赖工具（可选，用于生成音频）:
  - eSpeak NG - 文本转语音引擎
  - audiosprite - 音频雪碧图生成
  - ffmpeg - 音频处理
  - sox - 音频效果处理

### 🎯 使用示例

```tsx
import { usePhonemeAudio } from '@/hooks/usePhonemeAudio';

function MyComponent() {
  const { play, isPlaying, lastStrategy } = usePhonemeAudio();

  return (
    <button 
      onClick={() => play('v1')}
      disabled={isPlaying}
    >
      {isPlaying ? '播放中...' : '听发音'}
    </button>
  );
}
```

### 🚀 快速开始

```bash
# 1. 安装音频生成工具（可选）
brew install espeak-ng ffmpeg sox jq
npm install -g audiosprite

# 2. 生成音频资产
./scripts/generate-phonemes.sh

# 3. 启动开发服务器
npm run dev
```

### ⚡ 性能优化

- 懒加载 sprite 文件（延迟1秒）
- 音频压缩（MP3，24kHz）
- 元音与辅音分片
- 按需加载策略

### ♿ 无障碍支持

- ARIA 标签完整
- 键盘可达性
- 屏幕阅读器友好
- 播放状态提示

### 🔐 安全

- 输入验证（文本长度限制）
- Tauri Shell Allowlist 配置
- 无用户数据收集

### 📊 兼容性

- ✅ Chrome/Edge (Web Audio API)
- ✅ Safari (Web Audio API)
- ✅ Firefox (Web Audio API)
- ✅ macOS Tauri (say command)
- ✅ 所有浏览器（Web Speech API 兜底）

---

## [0.1.0] - 2025-10-14

### 初始版本

- ✅ 基础音标展示系统
- ✅ 元音与辅音卡片
- ✅ 翻卡游戏
- ✅ 学习进度追踪
- ✅ Zustand 状态管理
- ✅ Tailwind CSS 4 样式
- ✅ TypeScript 类型安全

---

**格式说明**:
- ✨ 新增功能
- 🔄 变更
- ⚠️ 废弃
- 🐛 修复
- 📚 文档
- 🛠️ 工具/配置
- 🚀 性能优化
- ♿ 无障碍
- 🔐 安全

遵循 [Keep a Changelog](https://keepachangelog.com/) 格式。
