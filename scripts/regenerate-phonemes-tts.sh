#!/bin/bash
# 重新生成48个音标发音（使用载体音节技巧）

set -e

# 配置
VOICE="${VOICE:-Samantha}"  # 英文音标用英文声音
RATE="${RATE:-150}"          # 语速：稍慢，清晰发音
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/audio/phonemes"
CONFIG_FILE="$(cd "$(dirname "$0")/.." && pwd)/src/data/phoneme-audio-config.json"
BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/audio/backup-phonemes-$(date +%Y%m%d-%H%M%S)"

echo "🔊 使用 TTS 重新生成音标发音"
echo "📍 输出目录: $OUTPUT_DIR"
echo "🎤 使用声音: $VOICE (英文)"
echo "⚡ 语速: $RATE 词/分钟"
echo ""

# 检查依赖
if ! command -v say &> /dev/null; then
    echo "❌ 错误: 需要 macOS say 命令"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ 错误: 需要 ffmpeg"
    echo "请运行: brew install ffmpeg"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ 错误: 需要 Node.js"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 错误: 找不到配置文件 $CONFIG_FILE"
    exit 1
fi

# 创建目录
mkdir -p "$OUTPUT_DIR"
mkdir -p "$BACKUP_DIR"

# 备份旧文件
echo "📦 备份旧 sprite 文件..."
cp /Users/wushaobing911/Desktop/zrpd/public/assets/audio/phonemes-*.* "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ 备份完成"
echo ""

# 提取音标数量
echo "📝 解析音标配置..."
phoneme_count=$(node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
console.log(data.phonemes.length);
")

echo "📚 找到 $phoneme_count 个音标"
echo ""

# 生成单个音标
generate_phoneme() {
    local phoneme_id="$1"
    local symbol="$2"
    local carrier_text="$3"
    local duration="$4"
    
    local temp_aiff="$OUTPUT_DIR/${phoneme_id}-temp.aiff"
    local output_mp3="$OUTPUT_DIR/${phoneme_id}.mp3"
    
    echo "🎙️  $phoneme_id [$symbol]: \"$carrier_text\""
    
    # 使用载体音节发音（更自然）
    if say -v "$VOICE" -r "$RATE" -o "$temp_aiff" "$carrier_text" 2>/dev/null; then
        # 转换为 MP3
        if ffmpeg -y -i "$temp_aiff" -ar 24000 -b:a 64k -t 1.5 "$output_mp3" &> /dev/null; then
            rm -f "$temp_aiff"
            echo "   ✅ 成功"
        else
            echo "   ⚠️  转换失败"
            rm -f "$temp_aiff"
        fi
    else
        echo "   ❌ say 失败"
    fi
}

export -f generate_phoneme
export VOICE RATE OUTPUT_DIR

# 解析配置并生成
echo "🚀 开始生成音标..."
echo ""

node << 'EOF'
const fs = require('fs');
const { execSync } = require('child_process');

const data = JSON.parse(fs.readFileSync(process.env.CONFIG_FILE || 'src/data/phoneme-audio-config.json', 'utf8'));
const phonemes = data.phonemes;

let count = 0;
for (const phoneme of phonemes) {
    count++;
    const id = phoneme.id;
    const symbol = phoneme.symbol;
    // 使用 isolated 载体音节
    const carrierText = phoneme.carrier?.isolated || phoneme.sampleText || symbol;
    const duration = phoneme.duration || 500;
    
    try {
        execSync(`bash -c 'generate_phoneme "${id}" "${symbol}" "${carrierText}" "${duration}"'`, {
            stdio: 'inherit',
            env: { ...process.env }
        });
    } catch (error) {
        console.error(`   ❌ 生成失败: ${id}`);
    }
    
    // 每10个显示进度
    if (count % 10 === 0) {
        console.log(`\n📊 进度: ${count}/${phonemes.length}\n`);
    }
}

console.log(`\n✅ 完成！共生成 ${count} 个音标文件`);
EOF

echo ""
echo "🎉 音标生成完成！"
echo ""
echo "📊 统计:"
echo "   输出目录: $OUTPUT_DIR"
echo "   备份目录: $BACKUP_DIR"
echo "   文件数量: $(ls $OUTPUT_DIR/*.mp3 2>/dev/null | wc -l)"
echo ""
echo "💡 下一步："
echo "   1. 试听: afplay $OUTPUT_DIR/v1.mp3"
echo "   2. 可选：打包为 sprite（audiosprite）"
echo "   3. 或直接使用单独的 MP3 文件"
echo ""
echo "🔄 恢复旧 sprite:"
echo "   cp $BACKUP_DIR/*.* /Users/wushaobing911/Desktop/zrpd/public/assets/audio/"
