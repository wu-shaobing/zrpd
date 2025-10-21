# 音频资产目录

## 📁 当前状态

- ✅ `phonemes-vowels.json` - 元音索引（占位）
- ✅ `phonemes-consonants.json` - 辅音索引（占位）
- ⚠️ `phonemes-vowels.mp3` - **需要生成**
- ⚠️ `phonemes-consonants.mp3` - **需要生成**

## 🚀 生成真实音频

### 快速开始

```bash
# 1. 安装依赖（macOS）
brew install espeak-ng ffmpeg sox
npm install -g audiosprite

# 2. 返回项目根目录并运行脚本
cd /Users/wushaobing911/Desktop/zrpd
./scripts/generate-phonemes.sh

# 3. 验证生成
ls -lh public/assets/audio/*.mp3
```

### 当前兜底策略

在音频文件生成之前，应用会自动使用以下兜底策略：

1. ❌ **本地 Sprite** - 缺少 MP3 文件，无法使用
2. ✅ **Tauri TTS** - macOS `say` 命令（Tauri 环境可用）
3. ✅ **Web Speech API** - 浏览器内置 TTS（所有环境可用）

应用仍然可以正常运行，只是会使用 TTS 引擎而非预置音频。

## 📚 详细文档

- [音频生成脚本说明](../../../scripts/README.md)
- [音频系统架构](../../../docs/AUDIO_SYSTEM.md)
- [快速开始指南](../../../docs/AUDIO_QUICKSTART.md)

## ⚠️ 注意事项

- MP3 文件不应提交到 git（体积较大）
- 每次修改 `phoneme-audio-config.json` 后需重新生成
- 本地开发可以不生成音频，使用 TTS 兜底

---

**生成时间**: 未生成  
**文件大小**: N/A  
**音素数量**: 48（20元音 + 28辅音）
