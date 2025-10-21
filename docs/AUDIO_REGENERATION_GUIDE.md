# 课程音频重新生成指南

## 概述

使用新的 TTS 系统重新生成所有 48 个课程讲解音频，替换旧的 MP3 文件，使用更适合小朋友的声音。

## 推荐声音（macOS）

### 🎀 女声（适合女童）
- **Tingting** （婷婷）- **强烈推荐** ⭐️⭐️⭐️⭐️⭐️
  - 温柔自然，标准普通话
  - 适合大多数场景
  - 音色亲切，小朋友容易接受

- **Flo** （小芙）
  - 活泼明快，年轻声线
  - 适合活泼好动的孩子

- **Sandy** （小珊）
  - 柔和温暖，亲切温柔
  - 适合安静内敛的孩子

### 👦 男声（适合男童）
- **Eddy** （小艾）
  - 年轻活力，阳光开朗
  - 适合男童

### 👵 特殊声音
- **Grandma** （奶奶）
  - 慈祥温暖，和蔼可亲
  - 适合年幼儿童（3-5岁）

## 使用方法

### 1. 基础用法（使用默认 Tingting 声音）

```bash
cd /Users/wushaobing911/Desktop/zrpd
./scripts/regenerate-lessons-tts.sh
```

### 2. 指定其他声音

```bash
# 使用活泼女声 Flo
VOICE=Flo ./scripts/regenerate-lessons-tts.sh

# 使用男声 Eddy
VOICE=Eddy ./scripts/regenerate-lessons-tts.sh

# 使用奶奶声音（适合低龄）
VOICE=Grandma ./scripts/regenerate-lessons-tts.sh
```

### 3. 调整语速

```bash
# 慢速（适合3-5岁，160词/分钟）
RATE=160 ./scripts/regenerate-lessons-tts.sh

# 正常速度（默认，180词/分钟）
RATE=180 ./scripts/regenerate-lessons-tts.sh

# 快速（适合8岁以上，200词/分钟）
RATE=200 ./scripts/regenerate-lessons-tts.sh
```

### 4. 组合使用

```bash
# 使用奶奶声音 + 慢速
VOICE=Grandma RATE=160 ./scripts/regenerate-lessons-tts.sh

# 使用 Flo + 快速
VOICE=Flo RATE=200 ./scripts/regenerate-lessons-tts.sh
```

## 执行流程

1. **备份旧音频** - 自动备份到 `public/audio/lessons/backup-{timestamp}/`
2. **解析课程文本** - 从 `lessons-index.json` 提取所有 48 个课程
3. **批量生成音频** - 使用 macOS `say` 命令生成
4. **转换格式** - AIFF → MP3（24kHz, 96kbps）
5. **显示进度** - 每10个显示一次进度

## 预计时间

- **总时间**: 约 5-8 分钟（48 个文件）
- **单个文件**: 5-10 秒

## 文件大小

- 旧文件：~238KB/文件，总计约 11MB
- 新文件：预计 ~30-50KB/文件，总计约 2-3MB（更小）

## 安全措施

### 自动备份
旧音频会自动备份到带时间戳的目录，例如：
```
public/audio/lessons/backup-20251021-142500/
```

### 恢复旧音频
如果不满意新生成的音频：
```bash
# 查看备份目录
ls public/audio/lessons/backup-*/

# 恢复（替换 {timestamp} 为实际时间戳）
cp public/audio/lessons/backup-{timestamp}/*.mp3 public/audio/lessons/
```

## 系统要求

### 必需
- **macOS** - 使用系统 `say` 命令
- **ffmpeg** - 音频格式转换

### 安装 ffmpeg
```bash
brew install ffmpeg
```

### 检查声音可用性
```bash
# 列出所有中文声音
say -v '?' | grep zh

# 试听
say -v Tingting "你好，小朋友们"
```

## 对比测试

### 试听当前旧音频
```bash
afplay public/audio/lessons/v1-lesson.mp3
```

### 生成测试样本（不覆盖）
```bash
# 生成单个测试文件
say -v Tingting -r 180 "让我们来学习音标。这是短元音 i。" -o /tmp/test.aiff
ffmpeg -y -i /tmp/test.aiff -ar 24000 -b:a 96k /tmp/test.mp3
afplay /tmp/test.mp3
```

## 注意事项

1. **检查声音**: 确保系统已安装目标声音
   - 系统偏好设置 > 辅助功能 > 朗读内容 > 系统语音
   - 下载"Tingting"（中文-中国）

2. **避免中断**: 生成过程中避免系统休眠

3. **磁盘空间**: 确保至少有 50MB 可用空间

4. **验证结果**: 生成后随机播放几个文件确认质量

## 常见问题

### Q: 为什么要重新生成？
A: 
- 使用更适合小朋友的声音（Tingting 温柔自然）
- 统一音色和语速
- 减小文件体积
- 使用我们新配置的 TTS 系统

### Q: 可以保留旧文件吗？
A: 可以！脚本会自动备份，你可以随时恢复

### Q: 可以只生成部分文件吗？
A: 目前脚本会生成全部 48 个文件。如需单独生成，可以手动运行：
```bash
say -v Tingting -r 180 "课程文本" -o output.aiff
ffmpeg -y -i output.aiff -ar 24000 -b:a 96k output.mp3
```

### Q: 生成失败怎么办？
A: 
1. 检查 ffmpeg 是否安装：`which ffmpeg`
2. 检查声音是否可用：`say -v Tingting "测试"`
3. 查看错误日志，按提示操作

## 立即开始

### 推荐配置（适合大多数儿童）
```bash
cd /Users/wushaobing911/Desktop/zrpd
./scripts/regenerate-lessons-tts.sh
```

这将使用：
- 声音：Tingting（温柔女声）
- 语速：180 词/分钟（适中）
- 格式：MP3, 24kHz, 96kbps

生成完成后，刷新应用即可使用新音频！🎉
