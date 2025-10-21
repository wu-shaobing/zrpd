# 音素音频生成系统

本目录包含用于生成自然拼读音素音频资产的脚本和配置。

## 🎯 目标

为48个英语音素（20元音 + 28辅音）生成高质量、一致的本地音频素材，支持离线播放。

## 📋 系统架构

应用采用**三层语音架构**，按优先级递减：

1. **本地音频 Sprite** (首选)
   - 预置音频文件，一致性最好
   - 使用 Web Audio API 播放指定片段
   - 支持淡入淡出，无点击声

2. **Tauri TTS** (兜底1)
   - macOS `say` 命令
   - 使用载体音节技巧（如 "uh-th-uh"）
   - 需要 Tauri shell allowlist

3. **Web Speech API** (兜底2)
   - 浏览器内置 TTS
   - 环境差异大，但无需额外依赖

## 🔧 依赖安装

### macOS

```bash
# 1. 安装 eSpeak NG（TTS 引擎）
brew install espeak-ng

# 2. 安装音频处理工具
brew install ffmpeg sox

# 3. 安装 JSON 解析工具
brew install jq

# 4. 安装 audiosprite（全局 npm 包）
npm install -g audiosprite
```

### Linux (Ubuntu/Debian)

```bash
# 1. 安装 eSpeak NG
sudo apt-get install espeak-ng

# 2. 安装音频处理工具
sudo apt-get install ffmpeg sox

# 3. 安装 jq
sudo apt-get install jq

# 4. 安装 audiosprite
npm install -g audiosprite
```

### Windows

推荐使用 WSL2 或 Git Bash：

```bash
# 通过 scoop 安装（需先安装 scoop）
scoop install espeak-ng ffmpeg sox jq
npm install -g audiosprite
```

## 🚀 使用方法

### 生成全部音频

```bash
# 从项目根目录运行
./scripts/generate-phonemes.sh
```

### 输出文件

生成的文件位于 `public/assets/audio/`：

- `phonemes-vowels.mp3` - 元音音频 sprite
- `phonemes-vowels.json` - 元音索引（Howler.js 格式）
- `phonemes-consonants.mp3` - 辅音音频 sprite  
- `phonemes-consonants.json` - 辅音索引

### 验证输出

```bash
# 检查文件大小
ls -lh public/assets/audio/

# 播放测试（macOS）
afplay public/assets/audio/phonemes-vowels.mp3
afplay public/assets/audio/phonemes-consonants.mp3
```

## 📐 配置说明

音素配置位于 `src/data/phoneme-audio-config.json`：

```json
{
  "id": "v1",           // 音素ID
  "symbol": "ɪ",        // IPA符号
  "graphemes": ["i"],   // 字母/组合
  "category": "vowel",  // 类别
  "spriteKey": "phonemes-vowels",
  "region": {
    "start": 0,         // sprite中的起始时间（ms）
    "end": 450          // 结束时间（ms）
  },
  "carrier": {
    "isolated": "ih",   // TTS兜底文本
    "initial": "ih",
    "medial": "uh-ih-uh",
    "final": "ih"
  },
  "ariaLabel": "短元音 i，如 bit",
  "duration": 450,
  "sampleText": "bit"
}
```

## 🎨 音质调优

### 修改 eSpeak 参数

编辑 `generate-phonemes.sh` 中的 `generate_phoneme` 函数：

```bash
espeak-ng \
  -v en-us \          # 语音（en-us/en-gb/en-scottish）
  -s 120 \            # 语速（80-200 wpm，默认120）
  -a 200 \            # 音量（0-200，默认200）
  -p 50 \             # 音高（0-99，默认50）
  "$carrier" \
  --stdout
```

### 调整音频处理

修改 sox 参数：

```bash
sox -t wav - -r 24000 -c 1 "$output_file" \
  fade 0.005 0 0.005 \   # 淡入淡出（秒）
  norm -0.1 \            # 响度标准化（-0.1dB 留出余量）
  treble +2              # 可选：高频增强
```

### 手动替换音素

如果某个音素发音不理想：

1. 手动录制/下载对应音素的 `.wav` 文件
2. 放置到 `tmp/phoneme-audio/vowels/` 或 `consonants/` 目录
3. 确保文件名与音素ID一致（如 `v1.wav`）
4. 重新运行打包命令：

```bash
cd tmp/phoneme-audio/vowels
audiosprite \
  --output ../../public/assets/audio/phonemes-vowels \
  --export mp3 \
  --format howler \
  --channels 1 \
  --samplerate 24000 \
  *.wav
```

## 🧪 测试生成的音频

### 使用 Web Audio API 测试

在浏览器控制台：

```javascript
// 加载 sprite
const audio = new Audio('/assets/audio/phonemes-vowels.mp3');
const ctx = new AudioContext();

fetch('/assets/audio/phonemes-vowels.json')
  .then(r => r.json())
  .then(sprite => {
    console.log('可用音素:', Object.keys(sprite.spritemap));
  });
```

### 使用应用测试

1. 启动开发服务器：`npm run dev`
2. 打开 http://localhost:1420
3. 点击任意音标卡片的"听发音"按钮
4. 检查浏览器控制台的日志，确认使用了 `sprite` 策略

## 🐛 故障排查

### 问题：`espeak-ng: command not found`

**解决**：确保 eSpeak NG 已安装并在 PATH 中：

```bash
which espeak-ng
espeak-ng --version
```

### 问题：生成的音频太短或太长

**解决**：调整 `phoneme-audio-config.json` 中的 `duration` 字段，或修改脚本中的 sox 参数。

### 问题：音频有爆音/点击声

**解决**：增加淡入淡出时间：

```bash
fade 0.01 0 0.01  # 从5ms增加到10ms
```

### 问题：sprite 文件过大

**解决**：

1. 降低采样率：`-r 22050` 或 `-r 16000`
2. 使用更激进的压缩：`--export ogg` 或 `--bitrate 64`

### 问题：音素发音不自然

**解决**：

1. 调整载体音节（在配置文件中）
2. 使用不同的 eSpeak 语音：`-v en-gb`、`-v en-scottish`
3. 手动录制替换

## 📚 参考资源

- [eSpeak NG 文档](https://github.com/espeak-ng/espeak-ng)
- [audiosprite 仓库](https://github.com/tonistiigi/audiosprite)
- [Howler.js 音频库](https://github.com/goldfire/howler.js)
- [IPA 音标参考](https://www.internationalphoneticassociation.org/)
- [CMU 发音词典](https://github.com/cmusphinx/cmudict)

## 🔄 更新流程

当需要修改音素列表或配置时：

1. 编辑 `src/data/phoneme-audio-config.json`
2. 重新运行 `./scripts/generate-phonemes.sh`
3. 清除浏览器缓存或使用硬刷新（Cmd+Shift+R）
4. 测试新音频

## 📊 批量质量检查

可选：创建测试脚本验证所有音素：

```bash
#!/bin/bash
# test-phonemes.sh

for file in public/assets/audio/*.mp3; do
  echo "测试: $file"
  
  # 检查文件大小
  size=$(stat -f%z "$file")
  if [ $size -lt 1000 ]; then
    echo "⚠️  文件太小: $file ($size bytes)"
  fi
  
  # 检查音频长度（需要 ffprobe）
  duration=$(ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$file")
  echo "  时长: ${duration}s"
done
```

## 💡 最佳实践

1. **版本控制**：将生成的 sprite 文件提交到 git，确保团队一致
2. **CI/CD**：在 CI 中验证音频文件存在且大小合理
3. **备份源文件**：保留原始 wav 文件以便后续调整（不提交到 git）
4. **定期更新**：eSpeak 升级时重新生成，确保音质改进
5. **A/B 测试**：对比不同配置的音质，选择最佳参数

## 🤝 贡献指南

如果发现某个音素发音不准确：

1. 在 Issue 中说明音素ID和问题
2. 如有可能，提供正确的音频文件或参考链接
3. 建议修改配置（载体音节、eSpeak 参数等）

---

**维护者**: 项目团队  
**最后更新**: 2025-10-16
