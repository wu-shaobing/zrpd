#!/bin/bash
# 使用英文声音重新生成单词发音（适合小朋友）

set -e

# 配置
VOICE="${VOICE:-Samantha}"  # macOS 英文女声，清晰友好
RATE="${RATE:-160}"          # 语速：160词/分钟（稍慢，适合学习）
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/audio/words"
WORDS_INDEX="$OUTPUT_DIR/words-index.json"
BACKUP_DIR="$OUTPUT_DIR/backup-$(date +%Y%m%d-%H%M%S)"

echo "🔊 使用 TTS 系统重新生成单词发音"
echo "📍 输出目录: $OUTPUT_DIR"
echo "🎤 使用声音: $VOICE (英文)"
echo "⚡ 语速: $RATE 词/分钟"
echo ""

# 检查 say 命令（macOS）
if ! command -v say &> /dev/null; then
    echo "❌ 错误: 需要 macOS say 命令"
    exit 1
fi

# 检查 ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ 错误: 需要 ffmpeg 命令"
    echo "请运行: brew install ffmpeg"
    exit 1
fi

# 检查 words-index.json
if [ ! -f "$WORDS_INDEX" ]; then
    echo "❌ 错误: 找不到 $WORDS_INDEX"
    exit 1
fi

# 备份旧音频
echo "📦 备份旧音频到: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp "$OUTPUT_DIR"/*.mp3 "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ 备份完成"
echo ""

# 提取所有单词
echo "📝 提取单词列表..."
word_count=$(node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$WORDS_INDEX', 'utf8'));
console.log(Object.keys(data.words).length);
")

echo "📚 找到 $word_count 个单词"
echo ""

# 生成函数
generate_audio() {
    local word="$1"
    local audio_file="$2"
    local temp_aiff="$OUTPUT_DIR/${word}-temp.aiff"
    local output_mp3="$OUTPUT_DIR/${audio_file}"
    
    echo "🎙️  生成: $word ($audio_file)"
    
    # 使用 say 生成 AIFF（慢速适合学习）
    if say -v "$VOICE" -r "$RATE" -o "$temp_aiff" "$word" 2>/dev/null; then
        # 转换为 MP3
        if ffmpeg -y -i "$temp_aiff" -ar 24000 -b:a 64k "$output_mp3" &> /dev/null; then
            rm -f "$temp_aiff"
            echo "   ✅ 成功"
        else
            echo "   ⚠️  ffmpeg 转换失败"
            rm -f "$temp_aiff"
        fi
    else
        echo "   ❌ say 命令失败"
    fi
}

export -f generate_audio
export VOICE RATE OUTPUT_DIR

# 使用 Node.js 解析 JSON 并生成音频
echo "🚀 开始生成音频..."
echo ""

node << 'EOF'
const fs = require('fs');
const { execSync } = require('child_process');

const data = JSON.parse(fs.readFileSync(process.env.WORDS_INDEX || 'public/audio/words/words-index.json', 'utf8'));
const words = data.words;

let count = 0;
for (const [word, audioFile] of Object.entries(words)) {
    count++;
    
    // 调用 bash 函数
    try {
        execSync(`bash -c 'generate_audio "${word}" "${audioFile}"'`, {
            stdio: 'inherit',
            env: { ...process.env }
        });
    } catch (error) {
        console.error(`   ❌ 生成失败: ${word}`);
    }
    
    // 每20个显示进度
    if (count % 20 === 0) {
        console.log(`\n📊 进度: ${count}/${Object.keys(words).length}\n`);
    }
}

console.log(`\n✅ 完成！共生成 ${count} 个音频文件`);
EOF

echo ""
echo "🎉 全部完成！"
echo ""
echo "📊 统计信息:"
echo "   备份目录: $BACKUP_DIR"
echo "   输出目录: $OUTPUT_DIR"
echo "   使用声音: $VOICE (英文)"
echo ""
echo "🧹 如需恢复旧音频:"
echo "   cp $BACKUP_DIR/*.mp3 $OUTPUT_DIR/"
