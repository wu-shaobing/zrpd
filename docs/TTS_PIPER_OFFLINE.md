# Piper 纯离线集成（高自然度）

目标：为中/英文提供更自然的离线 TTS。在不连接网络的前提下，利用 Piper 本地模型合成语音。

注意：中文高质量模型较少、体积较大；若缺少合适中文模型，建议中文走系统 TTS（tts-rs），英文走 Piper。

## 两种接入方式

1) 构建期预生成（推荐先做）
- 使用 Piper CLI 在构建阶段批量生成固定讲解/示例的音频文件（wav→mp3），打包到 `public/assets/audio/`。
- 优点：运行时零依赖、零初始化开销；可与现有 sprite 体系无缝融合。
- 适用：音素讲解、固定句子、课程字幕等。

2) 运行时合成（可选升级）
- 在 Tauri 后端加载 Piper 模型，接收文本并实时合成为 PCM/WAV，然后播放或保存为缓存文件。
- 优点：可播报任意文本，自由度高。
- 代价：首次加载模型耗时、内存占用、二进制/模型体积增加；需要在打包时添加模型与（可选）sidecar 可执行文件。

## 目录与资源

- 模型存放：`src-tauri/resources/piper/voices/`
- 配置映射：`src/data/tts/voices.json`

voices.json（示意）：
```json
{
  "default": {
    "en-US": "en_US-amy-medium",
    "zh-CN": "zh_CN-huayan-medium"
  },
  "voices": [
    { "id": "en_US-amy-medium", "lang": "en-US", "path": "piper/voices/en/en_US-amy-medium.onnx" },
    { "id": "zh_CN-huayan-medium", "lang": "zh-CN", "path": "piper/voices/zh/zh_CN-huayan-medium.onnx" }
  ]
}
```

> 以上中文模型仅为示意，实际以 Piper 官方可用清单为准；如无合适中文模型，请将 zh-CN 映射到 "system"（即 tts-rs）。

## 构建期预生成流程

- 选择待合成文本清单（如 `src/data/tts/script.json`）。
- 使用脚本调用 Piper CLI 生成 wav：
```bash
# path: scripts/tts_piper_build.sh（示意）
PIPER=./tools/piper
VOICE=src-tauri/resources/piper/voices/en/en_US-amy-medium.onnx
OUT=public/assets/audio/piper
mkdir -p "$OUT"

while IFS=$'\t' read -r id lang text; do
  "$PIPER" --model "$VOICE" --output_file "$OUT/$id.wav" --length_scale 1.0 --noise_scale 0.667 <<< "$text"
  ffmpeg -y -i "$OUT/$id.wav" -ar 24000 -b:a 96k "$OUT/$id.mp3"
done < src/data/tts/script.tsv
```
- 将生成文件纳入现有 audiosprite 流程（可选），或直接按 id 播放。

## 运行时合成（Tauri 后端）

命令设计：
- tts_piper_load(voiceId) → 加载与预热模型
- tts_speak_piper(text, { lang?, voiceId?, rate?, pitch?, out?: 'play'|'file'|'pcm' })
- tts_list_voices() → 合并 system 与 piper 列表（用 engine 字段区分）

实现路径：
- 方案 A：将 Piper 作为 sidecar 可执行文件，在后端以受控方式调用，stdout 输出 PCM/WAV，避免扩展 allowlist 到任意路径。
- 方案 B：链接 Piper 库（若提供稳定 ABI/FFI），直接在 Rust 内调用（较复杂）。

> 安全：若采用 sidecar，需要在打包时将其放入应用资源目录，并在 Tauri 侧仅允许该受控路径与固定参数，禁止任意命令拼接。

## 语言与回退

- en-US：优先 Piper；缺失则回退 tts-rs。
- zh-CN：若有可接受的 Piper 中文模型则使用；否则回退 tts-rs。

## QA 要点

- 模型加载时间、内存占用、CPU 使用率（短句基准 < 500ms）。
- 中英文均可正常播报；中文模型缺失时自动回退系统语音。
- 批量构建的音频与课程文本一致，无错字/截断；采样率、码率符合播放器预期。

## 许可与归属

- Piper 与各模型遵循其各自的许可证；需要在 `docs/TTS_SECURITY_AND_LICENSE.md` 与 NOTICE 中列明模型来源与许可文本。
