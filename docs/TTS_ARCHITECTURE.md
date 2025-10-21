# TTS 架构方案（Tauri + tts-rs 兜底；Piper 纯离线高自然度）

本方案在保持“离线优先、可控、安全”的前提下，为中英文讲解/播报提供两条路径：

- 路径 A（运行时兜底）: Tauri 后端集成 tts-rs，调用系统语音引擎（macOS NSSpeechSynthesizer、Windows SAPI、Linux Speech Dispatcher）。优点：体积小、跨平台、支持中英（取决于系统已安装语音）。缺点：音质因系统而异。
- 路径 B（高自然度纯离线）: 集成本地神经 TTS（Piper）。可在构建期批量合成固定文案，或在运行时按需合成。优点：完全离线、自然度高；缺点：模型体积较大，中文高质量模型稀缺且体积更大。

建议：
- Phoneme/固定教学文案：优先“音频 sprite（已有）→ Piper 预生成（可选）→ 系统 TTS（tts-rs）”。
- 自由文本/动态内容：优先“Piper 运行时（如配置了模型）→ 系统 TTS（tts-rs）→ Web Speech（仅开发环境备用）”。

## 模块边界

- 前端统一 API（src/lib/tts.ts）
  - speak(text, { lang, engine }) → 调度到 Tauri 命令
  - listVoices() → 取系统/Piper 可用音色
  - capability() → 返回当前可用引擎与语言
- Tauri 后端（src-tauri/src/）：
  - tts_system.rs（tts-rs 集成，系统语音）
  - tts_piper.rs（Piper 集成：运行时或构建期合成）
  - commands.rs（暴露 Tauri commands）
- 资源/配置：
  - src-tauri/resources/piper/voices/…（打包 Piper 模型）
  - src/data/tts/voices.json（默认音色与语言映射）

## 语言支持策略（zh/en）

- tts-rs：在运行时枚举系统语音列表，按 lang 前缀匹配（'zh', 'en'）。若未找到目标语言，回退到另一条路径（Piper/音频 sprite）。
- Piper：通过 voices.json 配置语言→默认模型映射；若中文模型缺失，回退系统 TTS（tts-rs）。

## 决策与回退矩阵

优先级按场景区分：

- 音素/固定讲解：sprite → Piper(预生成) → tts-rs → Web Speech
- 动态文本：Piper(运行时) → tts-rs → Web Speech

失败条件示例：
- sprite 缺文件/索引不匹配
- Piper 未找到模型/引擎初始化失败
- tts-rs 未匹配到目标语言音色

## Tauri Commands 约定

- tts_list_voices() → { engine: 'system'|'piper', voices: VoiceInfo[] }
- tts_speak_system(text, { lang?, voice?, rate?, pitch? })
- tts_piper_load(voiceId) → 预热/加载模型（可选）
- tts_speak_piper(text, { lang?, voiceId?, rate?, pitch?, out?: 'play'|'file'|'pcm' })
- tts_capability() → { system: { ok, langs }, piper: { ok, langs } }

说明：
- 速率/音调对齐：前端统一 0.5–2.0 范围，后端做引擎内映射。
- 返回错误码与可诊断信息（便于前端降级）。

## 体积与性能

- tts-rs：零额外模型体积；首次调用开销低。
- Piper：每个模型 20–100+ MB；建议仅打包所需语言（en、zh 各 1 个）。
- 运行时合成：短句（<3s）延迟通常 <500ms；可启用模型预热降低首次延迟。

## 安全与合规

- 不使用网络 TTS；不上传文本。
- 保持 Tauri Shell allowlist 最小化（不依赖 shell 调用即可集成 tts-rs；Piper 优先静态库/sidecar 受控调用）。
- Piper 模型遵循各自 License，需在 NOTICE 中列明来源与许可。

## 实施阶段

- P1：集成 tts-rs，提供系统 TTS（中/英自动选择）；前端统一 API 接入；QA 验收。
- P2：接入 Piper（先做构建期批量合成固定讲解作为 sprite 的补充/替代）；提供 voices.json 与打包配置。
- P3：可选的运行时 Piper 合成与流式播放（短文本），并完善回退矩阵与指标采集。
