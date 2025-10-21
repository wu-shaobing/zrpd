# 音频系统快速开始指南

> 5分钟内启用音素音频播放功能

## 🚀 快速开始

### 1. 安装依赖

**macOS**:
```bash
# 安装音频生成工具
brew install espeak-ng ffmpeg sox jq

# 安装 audiosprite（npm 全局包）
npm install -g audiosprite
```

**验证安装**:
```bash
espeak-ng --version
audiosprite --version
```

### 2. 生成音频资产

```bash
# 在项目根目录运行
./scripts/generate-phonemes.sh
```

预期输出：
```
=== 音素音频生成脚本 ===
✓ espeak-ng 已安装
✓ ffmpeg 已安装
✓ sox 已安装
✓ audiosprite 已安装

生成元音音频 (20个)...
  生成 ɪ (v1)
  生成 e (v2)
  ...

打包元音音频sprite...
打包辅音音频sprite...

✓ 完成！

生成的sprite文件:
  public/assets/audio/phonemes-vowels.mp3
  public/assets/audio/phonemes-vowels.json
  public/assets/audio/phonemes-consonants.mp3
  public/assets/audio/phonemes-consonants.json

文件大小:
  元音sprite: 1.2M
  辅音sprite: 1.5M
```

### 3. 启动应用测试

```bash
npm run dev
```

访问 http://localhost:1420，点击任意音标卡片的"听发音"按钮。

## ✅ 验证清单

- [ ] 脚本执行无错误
- [ ] `public/assets/audio/` 目录包含4个文件（2个mp3 + 2个json）
- [ ] 浏览器控制台显示 "PhonemeAudioAdapter initialized"
- [ ] 点击"听发音"按钮能听到声音
- [ ] 控制台日志显示使用 `sprite` 策略

## 📝 在组件中使用

### 基础用法

```tsx
import { usePhonemeAudio } from '@/hooks/usePhonemeAudio';

function MyComponent() {
  const { play, isPlaying } = usePhonemeAudio();

  return (
    <button 
      onClick={() => play('v1')}
      disabled={isPlaying}
    >
      {isPlaying ? '播放中...' : '播放音素 /ɪ/'}
    </button>
  );
}
```

### 高级用法（带选项）

```tsx
const { play, lastStrategy, availableStrategies } = usePhonemeAudio({
  autoInit: true,
  preloadSprites: ['phonemes-vowels'] // 预加载元音
});

// 播放音素，获取结果
const success = await play('v1', {
  volume: 0.8,
  onStart: () => console.log('开始播放'),
  onEnd: () => console.log('播放结束'),
  onError: (err) => console.error('播放失败', err)
});

console.log('使用的策略:', lastStrategy); // 'sprite' | 'tauri-tts' | 'web-speech'
```

## 🔧 自定义音质

### 调整 eSpeak 参数

编辑 `scripts/generate-phonemes.sh` 第 86 行：

```bash
espeak-ng -v en-us -s 120 -a 200 -p 50 "$carrier" --stdout
#              ↑     ↑     ↑     ↑
#              语音  语速  音量  音高
```

参数说明：
- `-v en-us`: 美式英语（可选 `en-gb` 英式）
- `-s 120`: 语速 120 wpm（范围 80-200）
- `-a 200`: 音量 200（范围 0-200）
- `-p 50`: 音高 50（范围 0-99）

### 手动替换音素

如果某个音素发音不满意：

1. 录制/下载 `.wav` 文件（24kHz，单声道）
2. 命名为对应的音素ID（如 `v1.wav`）
3. 放置到 `tmp/phoneme-audio/vowels/` 或 `consonants/`
4. 重新运行脚本打包

## ⚠️ 常见问题

### Q: 脚本报错 "espeak-ng: command not found"
**A**: 确保已安装 eSpeak NG：
```bash
brew install espeak-ng
# 或
sudo apt-get install espeak-ng
```

### Q: 点击播放按钮无反应
**A**: 
1. 检查浏览器控制台错误日志
2. 确认 sprite 文件存在：`ls public/assets/audio/`
3. 尝试硬刷新（Cmd+Shift+R）

### Q: 音频质量不佳
**A**:
1. 调整 eSpeak 参数（见上文）
2. 使用不同语音：`-v en-gb` 或 `-v en-scottish`
3. 考虑手动录制替换

### Q: 文件体积过大
**A**: 降低采样率（脚本第 87 行）：
```bash
sox -t wav - -r 16000 -c 1 "$output_file"  # 从24kHz降到16kHz
```

## 📚 进阶资源

- [完整架构文档](./AUDIO_SYSTEM.md)
- [脚本详细说明](../scripts/README.md)
- [类型定义](../src/types/phoneme-audio.ts)

## 🆘 获取帮助

如果遇到问题：

1. 查看[故障排查指南](./AUDIO_SYSTEM.md#故障排查)
2. 在 GitHub 提 Issue
3. 查看浏览器控制台日志

---

**提示**: 第一次运行脚本需要 2-3 分钟生成所有音素。后续修改只需重新打包，速度更快。
