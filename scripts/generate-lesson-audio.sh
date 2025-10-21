#!/bin/bash
#
# 生成音标讲解音频文件
# 从 lesson-scripts.json 读取文本，使用 macOS say 命令生成中文讲解 MP3
#

set -e

# 配置
SCRIPTS_FILE=".temp/lesson-scripts.json"
OUTPUT_DIR="public/audio/lessons"
TEMP_DIR="/tmp/lesson-audio-temp"
SAMPLE_RATE=22050
QUALITY=2

# 声音选择（可通过环境变量 VOICE 指定）
# 例如：VOICE=Eddy ./scripts/generate-lesson-audio.sh
# 注意：必须明确指定语言版本，避免使用英文版本
if [ -n "$VOICE" ]; then
  # 如果指定了声音，检查是否需要添加语言标识
  if [[ "$VOICE" != *"（"* ]]; then
    # 常用中文声音映射
    case "$VOICE" in
      "Shelley") VOICE="Shelley (中文（中国大陆）)" ;;
      "Tingting") VOICE="Tingting (中文（中国大陆）)" ;;
      "Eddy") VOICE="Eddy (中文（中国大陆）)" ;;
      "Flo") VOICE="Flo (中文（中国大陆）)" ;;
      "Sandy") VOICE="Sandy (中文（中国大陆）)" ;;
      "Reed") VOICE="Reed (中文（中国大陆）)" ;;
      "Rocko") VOICE="Rocko (中文（中国大陆）)" ;;
      "Grandma") VOICE="Grandma (中文（中国大陆）)" ;;
      "Grandpa") VOICE="Grandpa (中文（中国大陆）)" ;;
    esac
  fi
else
  # 默认使用 Tingting 中文女声
  VOICE="Tingting (中文（中国大陆）)"
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

# 检查必要工具
for cmd in say ffmpeg jq; do
  if ! command -v $cmd &> /dev/null; then
    echo "错误: 未找到 $cmd，请先安装"
    exit 1
  fi
done

# 检查 Tingting 声音是否可用
if ! say --voice="?" | grep -q "Tingting"; then
  echo "警告: Tingting 声音不可用，将使用默认中文声音"
  VOICE=""
fi

# 检查脚本文件
if [ ! -f "$SCRIPTS_FILE" ]; then
  echo "错误: 脚本文件不存在: $SCRIPTS_FILE"
  echo "请先运行: node scripts/generate-phoneme-lessons.js"
  exit 1
fi

echo "开始生成音标讲解音频文件..."
echo "脚本文件: $SCRIPTS_FILE"
echo "输出目录: $OUTPUT_DIR"
echo "使用声音: $VOICE"
echo ""

# 统计总数
total_count=$(jq '. | length' "$SCRIPTS_FILE")
current=0

# 逐个生成音频
jq -c '.[]' "$SCRIPTS_FILE" | while read -r item; do
  current=$((current + 1))
  
  # 提取字段
  phoneme_id=$(echo "$item" | jq -r '.id')
  text=$(echo "$item" | jq -r '.text')
  output_file="$OUTPUT_DIR/${phoneme_id}-lesson.mp3"
  
  # 如果文件已存在，跳过
  if [ -f "$output_file" ]; then
    echo "[$current/$total_count] 跳过: $phoneme_id (文件已存在)"
    continue
  fi
  
  temp_aiff="$TEMP_DIR/${phoneme_id}-lesson.aiff"
  
  # 使用 macOS say 命令生成 AIFF
  # -v: 声音 (Tingting - 中文女声)
  # -r: 语速 (180 词/分钟，适合教学)
  # -o: 输出文件
  if [ -n "$VOICE" ]; then
    say -v "$VOICE" -r 180 -o "$temp_aiff" "$text" 2>/dev/null
  else
    say -r 180 -o "$temp_aiff" "$text" 2>/dev/null
  fi
  
  # 使用 ffmpeg 转换为 MP3
  ffmpeg -i "$temp_aiff" \
    -ar "$SAMPLE_RATE" \
    -q:a "$QUALITY" \
    -y "$output_file" \
    -loglevel quiet 2>/dev/null
  
  # 删除临时文件
  rm -f "$temp_aiff"
  
  echo "[$current/$total_count] 完成: $phoneme_id -> ${phoneme_id}-lesson.mp3"
  
done

# 清理临时目录
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 所有音标讲解音频已生成到: $OUTPUT_DIR"
echo "📊 总计: $total_count 个音标"
echo ""
echo "🎉 完成!"
