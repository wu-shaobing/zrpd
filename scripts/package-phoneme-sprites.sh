#!/bin/bash
# 打包48个独立音标MP3为 audiosprite 格式
# 生成元音和辅音两个 sprite 文件

set -e

PHONEMES_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/audio/phonemes"
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/audio"

echo "🎵 打包音标为 audiosprite"
echo "📂 输入目录: $PHONEMES_DIR"
echo "📂 输出目录: $OUTPUT_DIR"
echo ""

# 检查依赖
if ! command -v audiosprite &> /dev/null; then
    echo "❌ 错误: 需要 audiosprite"
    echo "请运行: npm install -g audiosprite"
    exit 1
fi

if [ ! -d "$PHONEMES_DIR" ]; then
    echo "❌ 错误: 音标目录不存在 $PHONEMES_DIR"
    exit 1
fi

# 检查是否有音标文件
vowel_count=$(ls "$PHONEMES_DIR"/v*.mp3 2>/dev/null | wc -l)
consonant_count=$(ls "$PHONEMES_DIR"/c*.mp3 2>/dev/null | wc -l)

echo "📊 找到音标文件:"
echo "   元音: $vowel_count"
echo "   辅音: $consonant_count"
echo ""

if [ "$vowel_count" -eq 0 ] || [ "$consonant_count" -eq 0 ]; then
    echo "❌ 错误: 音标文件不完整"
    exit 1
fi

# 打包元音 (v1-v20)
echo "🎙️  打包元音..."
cd "$PHONEMES_DIR"
audiosprite \
  --output "$OUTPUT_DIR/phonemes-vowels" \
  --format howler \
  --export mp3 \
  --gap 0.1 \
  --bitrate 128 \
  --samplerate 44100 \
  v*.mp3

echo "✅ 元音 sprite 完成"
echo ""

# 打包辅音 (c1-c28)
echo "🎙️  打包辅音..."
audiosprite \
  --output "$OUTPUT_DIR/phonemes-consonants" \
  --format howler \
  --export mp3 \
  --gap 0.1 \
  --bitrate 128 \
  --samplerate 44100 \
  c*.mp3

echo "✅ 辅音 sprite 完成"
echo ""

# 检查输出文件
if [ -f "$OUTPUT_DIR/phonemes-vowels.mp3" ] && [ -f "$OUTPUT_DIR/phonemes-vowels.json" ]; then
    echo "✅ 元音 sprite 已生成:"
    ls -lh "$OUTPUT_DIR/phonemes-vowels".*
else
    echo "❌ 元音 sprite 生成失败"
    exit 1
fi

if [ -f "$OUTPUT_DIR/phonemes-consonants.mp3" ] && [ -f "$OUTPUT_DIR/phonemes-consonants.json" ]; then
    echo "✅ 辅音 sprite 已生成:"
    ls -lh "$OUTPUT_DIR/phonemes-consonants".*
else
    echo "❌ 辅音 sprite 生成失败"
    exit 1
fi

echo ""
echo "🎉 打包完成！"
echo ""
echo "📊 输出文件:"
echo "   $OUTPUT_DIR/phonemes-vowels.mp3"
echo "   $OUTPUT_DIR/phonemes-vowels.json"
echo "   $OUTPUT_DIR/phonemes-consonants.mp3"
echo "   $OUTPUT_DIR/phonemes-consonants.json"
