#!/bin/bash
#
# 试听不同的中文语音
# 用于选择最适合的讲解声音
#

set -e

# 测试文本
TEST_TEXT="大家好，我是你们的音标小老师。今天我们来学习短元音i。发音要领是：短促的'衣'音。记住这个小技巧：嘴唇微微张开，舌尖抵下齿。"

# 输出目录
OUTPUT_DIR="./voice-samples"
mkdir -p "$OUTPUT_DIR"

echo "🎵 生成不同声音的试听样本..."
echo "测试文本: $TEST_TEXT"
echo ""

# 可用的中文语音列表
VOICES=(
  "Tingting:婷婷(女声-温柔自然)"
  "Flo:小芙(女声-活泼明快)"
  "Sandy:小珊(女声-柔和温暖)"
  "Shelley:小雪(女声-清晰标准)"
  "Eddy:小艾(男声-年轻活力)"
  "Reed:小锐(男声-沉稳专业)"
  "Rocko:洛克(男声-磁性浑厚)"
  "Grandma:奶奶(慈祥温暖)"
  "Grandpa:爷爷(和蔼亲切)"
)

current=0
total=${#VOICES[@]}

for voice_info in "${VOICES[@]}"; do
  current=$((current + 1))
  
  # 分离声音名称和描述
  IFS=':' read -r voice_name description <<< "$voice_info"
  
  output_file="$OUTPUT_DIR/${voice_name}.aiff"
  
  echo "[$current/$total] 生成: $voice_name - $description"
  
  # 检查声音是否可用
  if ! say --voice="?" | grep -q "$voice_name"; then
    echo "  ⚠️  声音不可用，跳过"
    continue
  fi
  
  # 生成音频
  say -v "$voice_name" -r 180 -o "$output_file" "$TEST_TEXT" 2>/dev/null
  
  echo "  ✓ 已保存: $output_file"
  echo ""
done

echo ""
echo "✅ 试听样本已生成到: $OUTPUT_DIR"
echo ""
echo "📝 试听方法:"
echo "  1. 打开 Finder，进入 voice-samples 目录"
echo "  2. 双击任意 .aiff 文件播放"
echo "  3. 或使用命令: afplay voice-samples/Tingting.aiff"
echo ""
echo "🎯 推荐声音:"
echo "  • Tingting - 适合女童，温柔自然"
echo "  • Eddy - 适合男童，活力十足"
echo "  • Grandma - 适合年幼儿童，慈祥温暖"
echo ""
echo "💡 选择好后，运行以下命令重新生成讲解音频:"
echo "  VOICE=Tingting ./scripts/generate-lesson-audio.sh"
echo "  VOICE=Eddy ./scripts/generate-lesson-audio.sh"
