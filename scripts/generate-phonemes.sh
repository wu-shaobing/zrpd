#!/usr/bin/env bash
#
# 音素音频生成脚本
# 使用eSpeak-ng批量生成48个英语音素的音频文件，并打包为audio sprite
#
# 依赖:
#  - eSpeak-ng (brew install espeak-ng)
#  - ffmpeg (brew install ffmpeg)
#  - sox (brew install sox)
#  - audiosprite (npm install -g audiosprite)
#
# 用法: ./scripts/generate-phonemes.sh
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== 音素音频生成脚本 ===${NC}"

# 检查依赖
check_dependency() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}错误: $1 未安装${NC}"
    echo "请运行: brew install $1"
    exit 1
  else
    echo -e "${GREEN}✓${NC} $1 已安装"
  fi
}

echo -e "\n${YELLOW}检查依赖...${NC}"
check_dependency "espeak-ng"
check_dependency "ffmpeg"
check_dependency "sox"

if ! command -v "audiosprite" &> /dev/null; then
  echo -e "${RED}错误: audiosprite 未安装${NC}"
  echo "请运行: npm install -g audiosprite"
  exit 1
else
  echo -e "${GREEN}✓${NC} audiosprite 已安装"
fi

# 工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/src/data/phoneme-audio-config.json"
TMP_DIR="$PROJECT_ROOT/tmp/phoneme-audio"
OUTPUT_DIR="$PROJECT_ROOT/public/assets/audio"

echo -e "\n${YELLOW}创建临时目录...${NC}"
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR/vowels"
mkdir -p "$TMP_DIR/consonants"
mkdir -p "$OUTPUT_DIR"

# 读取配置并生成音素音频
# 注意: 使用jq解析JSON配置

if ! command -v "jq" &> /dev/null; then
  echo -e "${RED}错误: jq 未安装（用于解析JSON）${NC}"
  echo "请运行: brew install jq"
  exit 1
fi

# 生成单个音素音频
generate_phoneme() {
  local id="$1"
  local symbol="$2"
  local carrier="$3"
  local category="$4"
  local output_file="$5"
  
  echo -e "  生成 ${GREEN}${symbol}${NC} (${id})"
  
  # 使用espeak-ng生成
  # -v en-us: 美式英语
  # -s 120: 语速 120 wpm (稍慢利于学习)
  # -a 200: 音量
  # -w: 写入文件
  local temp_wav="${output_file}.tmp.wav"
  espeak-ng -v en-us -s 120 -a 200 "$carrier" -w "$temp_wav"
  
  # 应用音频处理：淡入淡出、标准化
  sox "$temp_wav" -r 24000 -c 1 "$output_file" \
    fade 0.005 0 0.005 \
    norm -0.1
  
  # 删除临时文件
  rm -f "$temp_wav"
}

echo -e "\n${YELLOW}生成元音音频 (20个)...${NC}"

# 元音列表（从配置文件读取）
VOWELS=$(jq -r '.phonemes[] | select(.category == "vowel" or .category == "diphthong") | "\(.id)|\(.symbol)|\(.carrier.isolated)"' "$CONFIG_FILE")

while IFS='|' read -r id symbol carrier; do
  output_file="$TMP_DIR/vowels/${id}.wav"
  generate_phoneme "$id" "$symbol" "$carrier" "vowel" "$output_file"
done <<< "$VOWELS"

echo -e "\n${YELLOW}生成辅音音频 (28个)...${NC}"

# 辅音列表
CONSONANTS=$(jq -r '.phonemes[] | select(.category == "consonant") | "\(.id)|\(.symbol)|\(.carrier.isolated)"' "$CONFIG_FILE")

while IFS='|' read -r id symbol carrier; do
  output_file="$TMP_DIR/consonants/${id}.wav"
  generate_phoneme "$id" "$symbol" "$carrier" "consonant" "$output_file"
done <<< "$CONSONANTS"

# 使用audiosprite打包
echo -e "\n${YELLOW}打包元音音频sprite...${NC}"
cd "$TMP_DIR/vowels"
audiosprite \
  --output "$OUTPUT_DIR/phonemes-vowels" \
  --export mp3 \
  --format howler \
  --channels 1 \
  --samplerate 24000 \
  *.wav

echo -e "\n${YELLOW}打包辅音音频sprite...${NC}"
cd "$TMP_DIR/consonants"
audiosprite \
  --output "$OUTPUT_DIR/phonemes-consonants" \
  --export mp3 \
  --format howler \
  --channels 1 \
  --samplerate 24000 \
  *.wav

# 清理临时文件
echo -e "\n${YELLOW}清理临时文件...${NC}"
rm -rf "$TMP_DIR"

# 显示结果
echo -e "\n${GREEN}✓ 完成！${NC}"
echo -e "生成的sprite文件:"
echo -e "  ${GREEN}${OUTPUT_DIR}/phonemes-vowels.mp3${NC}"
echo -e "  ${GREEN}${OUTPUT_DIR}/phonemes-vowels.json${NC}"
echo -e "  ${GREEN}${OUTPUT_DIR}/phonemes-consonants.mp3${NC}"
echo -e "  ${GREEN}${OUTPUT_DIR}/phonemes-consonants.json${NC}"

# 显示大小
if [ -f "$OUTPUT_DIR/phonemes-vowels.mp3" ]; then
  vowel_size=$(du -h "$OUTPUT_DIR/phonemes-vowels.mp3" | cut -f1)
  consonant_size=$(du -h "$OUTPUT_DIR/phonemes-consonants.mp3" | cut -f1)
  echo -e "\n文件大小:"
  echo -e "  元音sprite: ${vowel_size}"
  echo -e "  辅音sprite: ${consonant_size}"
fi

echo -e "\n${YELLOW}使用方法:${NC}"
echo "1. 音频文件已放置在 public/assets/audio/"
echo "2. 应用会自动从该路径加载"
echo "3. 如需调整音质，编辑此脚本中的espeak-ng参数"
echo ""
echo -e "${GREEN}提示:${NC} 如果音素发音不理想，可以手动录制替换对应的wav文件，然后重新运行打包命令"
