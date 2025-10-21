#!/bin/bash
#
# 生成示例单词音频文件
# 使用 espeak-ng 生成英文单词发音，并使用 ffmpeg 转换为 MP3
#

set -e

# 配置
WORDS_LIST="/tmp/words-list.txt"
OUTPUT_DIR="public/audio/words"
TEMP_DIR="/tmp/word-audio-temp"
SAMPLE_RATE=22050
QUALITY=2

# 创建输出目录
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

# 检查必要工具
for cmd in espeak-ng ffmpeg sox; do
  if ! command -v $cmd &> /dev/null; then
    echo "错误: 未找到 $cmd，请先安装"
    exit 1
  fi
done

# 检查单词列表文件
if [ ! -f "$WORDS_LIST" ]; then
  echo "错误: 单词列表文件不存在: $WORDS_LIST"
  exit 1
fi

echo "开始生成单词音频文件..."
echo "单词列表: $WORDS_LIST"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 统计
total_words=$(wc -l < "$WORDS_LIST")
current=0

# 生成每个单词的音频
while IFS= read -r word; do
  current=$((current + 1))
  
  # 跳过空行
  [ -z "$word" ] && continue
  
  # 文件名（小写）
  filename=$(echo "$word" | tr '[:upper:]' '[:lower:]')
  output_file="$OUTPUT_DIR/${filename}.mp3"
  
  # 如果文件已存在，跳过
  if [ -f "$output_file" ]; then
    echo "[$current/$total_words] 跳过: $word (文件已存在)"
    continue
  fi
  
  temp_wav="$TEMP_DIR/${filename}.wav"
  
  # 使用 espeak-ng 生成 WAV
  # -v en-us: 美式英语
  # -s 150: 速度 150 词/分钟（稍慢，便于学习）
  # -a 150: 音量 150
  # -w: 输出到文件
  espeak-ng -v en-us -s 150 -a 150 -w "$temp_wav" "$word" 2>/dev/null
  
  # 使用 ffmpeg 转换为 MP3
  # -ar: 采样率
  # -q:a: 质量（0-9，越小越好）
  # -y: 覆盖已存在文件
  ffmpeg -i "$temp_wav" \
    -ar "$SAMPLE_RATE" \
    -q:a "$QUALITY" \
    -y "$output_file" \
    -loglevel quiet 2>/dev/null
  
  # 删除临时文件
  rm -f "$temp_wav"
  
  echo "[$current/$total_words] 完成: $word -> ${filename}.mp3"
  
done < "$WORDS_LIST"

# 清理临时目录
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 所有单词音频已生成到: $OUTPUT_DIR"
echo "📊 总计: $total_words 个单词"
echo ""
echo "生成音频索引 JSON..."

# 生成音频索引 JSON
cd "$OUTPUT_DIR"
echo "{" > words-index.json
echo '  "version": "1.0.0",' >> words-index.json
echo '  "generated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",' >> words-index.json
echo '  "total": '$total_words',' >> words-index.json
echo '  "words": {' >> words-index.json

first=true
for mp3 in *.mp3; do
  [ "$mp3" = "*.mp3" ] && continue
  
  word="${mp3%.mp3}"
  
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> words-index.json
  fi
  
  echo -n "    \"$word\": \"$mp3\"" >> words-index.json
done

echo "" >> words-index.json
echo "  }" >> words-index.json
echo "}" >> words-index.json

echo "✅ 索引文件已生成: $OUTPUT_DIR/words-index.json"
echo ""
echo "🎉 完成!"
