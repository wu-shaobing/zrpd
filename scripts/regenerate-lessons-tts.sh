#!/bin/bash
# 使用新的 TTS 系统重新生成课程音频（适合小朋友的声音）

set -e

# 配置
VOICE="${VOICE:-Tingting}"  # macOS 中文女声，温柔自然
RATE="${RATE:-180}"          # 语速：180词/分钟（适中）
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/audio/lessons"
LESSONS_INDEX="$OUTPUT_DIR/lessons-index.json"
BACKUP_DIR="$OUTPUT_DIR/backup-$(date +%Y%m%d-%H%M%S)"

echo "🔊 使用 TTS 系统重新生成课程音频"
echo "📍 输出目录: $OUTPUT_DIR"
echo "🎤 使用声音: $VOICE"
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

# 检查 lessons-index.json
if [ ! -f "$LESSONS_INDEX" ]; then
    echo "❌ 错误: 找不到 $LESSONS_INDEX"
    exit 1
fi

# 备份旧音频
echo "📦 备份旧音频到: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp "$OUTPUT_DIR"/*.mp3 "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ 备份完成"
echo ""

# 提取所有课程ID和文本
echo "📝 提取课程文本..."
lesson_count=$(node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$LESSONS_INDEX', 'utf8'));
console.log(Object.keys(data.lessons).length);
")

echo "📚 找到 $lesson_count 个课程"
echo ""

# 生成函数
generate_audio() {
    local lesson_id="$1"
    local lesson_text="$2"
    local audio_file="$3"
    local temp_aiff="$OUTPUT_DIR/${lesson_id}-temp.aiff"
    local output_mp3="$OUTPUT_DIR/${audio_file}"
    
    echo "🎙️  生成: $lesson_id ($audio_file)"
    
    # 使用 say 生成 AIFF
    if say -v "$VOICE" -r "$RATE" -o "$temp_aiff" "$lesson_text" 2>/dev/null; then
        # 转换为 MP3
        if ffmpeg -y -i "$temp_aiff" -ar 24000 -b:a 96k "$output_mp3" &> /dev/null; then
            rm -f "$temp_aiff"
            echo "   ✅ 成功"
        else
            echo "   ⚠️  ffmpeg 转换失败，保留 AIFF"
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

const data = JSON.parse(fs.readFileSync(process.env.LESSONS_INDEX || 'public/audio/lessons/lessons-index.json', 'utf8'));
const lessons = data.lessons;

let count = 0;
for (const [id, lesson] of Object.entries(lessons)) {
    count++;
    const text = lesson.lessonCn || '';
    const audioFile = lesson.audioFile || `${id}-lesson.mp3`;
    
    // 调用 bash 函数
    try {
        execSync(`bash -c 'generate_audio "${id}" "${text.replace(/"/g, '\\"')}" "${audioFile}"'`, {
            stdio: 'inherit',
            env: { ...process.env }
        });
    } catch (error) {
        console.error(`   ❌ 生成失败: ${id}`);
    }
    
    // 每10个显示进度
    if (count % 10 === 0) {
        console.log(`\n📊 进度: ${count}/${Object.keys(lessons).length}\n`);
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
echo "   使用声音: $VOICE"
echo ""
echo "🧹 如需恢复旧音频:"
echo "   cp $BACKUP_DIR/*.mp3 $OUTPUT_DIR/"
