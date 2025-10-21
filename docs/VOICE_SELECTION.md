# 🎵 讲解声音选择指南

## 可用声音列表

macOS 系统提供了 9 种高质量的中文语音，您可以根据喜好选择：

### 👧 女声（适合女童）

| 声音名称 | 描述 | 特点 | 推荐场景 |
|---------|------|------|---------|
| **Tingting** | 婷婷 | 温柔自然，标准普通话 | ✅ **当前使用**，适合大多数场景 |
| **Flo** | 小芙 | 活泼明快，年轻声线 | 适合活泼好动的孩子 |
| **Sandy** | 小珊 | 柔和温暖，亲切温柔 | 适合安静内敛的孩子 |
| **Shelley** | 小雪 | 清晰标准，发音准确 | 适合注重标准发音的场景 |

### 👦 男声（适合男童）

| 声音名称 | 描述 | 特点 | 推荐场景 |
|---------|------|------|---------|
| **Eddy** | 小艾 | 年轻活力，阳光开朗 | 适合男童，充满活力 |
| **Reed** | 小锐 | 沉稳专业，成熟稳重 | 适合年龄稍大的孩子 |
| **Rocko** | 洛克 | 磁性浑厚，富有磁性 | 适合喜欢低音的场景 |

### 👵👴 特殊声音

| 声音名称 | 描述 | 特点 | 推荐场景 |
|---------|------|------|---------|
| **Grandma** | 奶奶 | 慈祥温暖，和蔼可亲 | 适合年幼儿童（3-5岁） |
| **Grandpa** | 爷爷 | 和蔼亲切，温和慈祥 | 适合喜欢爷爷讲故事的孩子 |

## 🎧 试听声音

### 方法一：自动生成试听样本

运行试听脚本，生成所有声音的样本：

```bash
./scripts/test-voices.sh
```

这将在 `voice-samples/` 目录生成 9 个音频样本。

### 方法二：播放试听样本

```bash
# 播放 Tingting（女声）
afplay voice-samples/Tingting.aiff

# 播放 Eddy（男声）
afplay voice-samples/Eddy.aiff

# 播放 Grandma（奶奶）
afplay voice-samples/Grandma.aiff
```

或者直接在 Finder 中双击文件播放。

### 方法三：命令行快速试听

```bash
# 试听 Tingting
say -v Tingting "大家好，我是你们的音标小老师"

# 试听 Eddy
say -v Eddy "大家好，我是你们的音标小老师"

# 试听 Grandma
say -v Grandma "大家好，我是你们的音标小老师"
```

## 🔄 切换声音

选择好喜欢的声音后，重新生成讲解音频：

### 1. 删除旧音频（可选）

```bash
rm -f public/audio/lessons/*.mp3
```

### 2. 生成新音频

```bash
# 使用 Tingting（女声 - 默认）
./scripts/generate-lesson-audio.sh

# 使用 Eddy（男声）
VOICE=Eddy ./scripts/generate-lesson-audio.sh

# 使用 Grandma（奶奶）
VOICE=Grandma ./scripts/generate-lesson-audio.sh

# 使用 Flo（活泼女声）
VOICE=Flo ./scripts/generate-lesson-audio.sh
```

### 3. 重新构建

```bash
npm run build
```

## 📊 声音对比

### 音色特点

```
温柔程度: Grandma > Tingting > Sandy > Shelley > Flo
活泼程度: Flo > Eddy > Shelley > Tingting > Sandy
低音程度: Grandpa > Rocko > Reed > Eddy > Tingting
清晰程度: Shelley > Reed > Tingting > Flo > Sandy
```

### 适用年龄

```
3-5岁:  Grandma, Grandpa, Tingting
6-8岁:  Tingting, Eddy, Flo
9-12岁: Shelley, Reed, Eddy
```

### 学习场景

```
安静学习: Tingting, Sandy, Shelley
活泼互动: Flo, Eddy
睡前复习: Grandma, Sandy
标准教学: Shelley, Reed
```

## 🎯 推荐组合

根据不同需求，我们推荐以下组合：

### 女童首选
1. **Tingting** - 默认选择，温柔自然
2. **Flo** - 活泼好动的孩子
3. **Sandy** - 安静内敛的孩子

### 男童首选
1. **Eddy** - 年轻活力
2. **Reed** - 稳重成熟

### 特殊需求
1. **Grandma** - 低龄儿童（3-5岁）
2. **Shelley** - 标准发音教学
3. **Grandpa** - 喜欢爷爷讲故事的氛围

## 💡 使用建议

### 1. 先试听再决定
不要直接生成，先用试听脚本听听不同的声音效果。

### 2. 考虑孩子的偏好
让孩子参与选择，他们更容易接受自己喜欢的声音。

### 3. 可以多次切换
如果孩子听腻了，可以随时切换到其他声音。

### 4. 注意年龄适配
- 3-5岁：选择温柔、慈祥的声音（Grandma, Tingting）
- 6-8岁：选择活泼、清晰的声音（Flo, Eddy, Tingting）
- 9岁以上：选择标准、专业的声音（Shelley, Reed）

## 🚀 快速命令

```bash
# 生成试听样本
./scripts/test-voices.sh

# 试听某个声音
afplay voice-samples/Tingting.aiff

# 切换到 Eddy 男声
rm -f public/audio/lessons/*.mp3
VOICE=Eddy ./scripts/generate-lesson-audio.sh
npm run build

# 切换回 Tingting 女声
rm -f public/audio/lessons/*.mp3
VOICE=Tingting ./scripts/generate-lesson-audio.sh
npm run build
```

## ⏱️ 生成时间

- 每个声音生成 48 个音标讲解
- 预计时间：约 2-3 分钟
- 文件大小：约 15-20MB

## 📝 注意事项

1. **系统要求**：macOS 系统内置语音
2. **备份建议**：切换声音前可以备份当前音频
3. **测试建议**：生成后先听几个音标，确认满意再使用
4. **清理建议**：试听完后可以删除 `voice-samples/` 目录

## 🎨 自定义调整

如果想调整语速或音调，可以编辑 `scripts/generate-lesson-audio.sh`：

```bash
# 当前配置
say -v "$VOICE" -r 180 -o "$temp_aiff" "$text"

# -r 180: 语速 180 词/分钟
# 可调整为：
# -r 160: 更慢，适合年幼儿童
# -r 200: 更快，适合年龄较大的孩子
```

## ❓ 常见问题

**Q: 如何知道当前使用的是什么声音？**
A: 运行生成脚本时会显示 "使用声音: Tingting"

**Q: 可以混合使用不同声音吗？**
A: 不建议，保持声音一致性更好

**Q: 声音听起来不自然怎么办？**
A: 尝试调整语速（-r 参数），或切换到其他声音

**Q: 可以使用其他语言的声音吗？**
A: 可以，但建议使用中文声音讲解中文内容
