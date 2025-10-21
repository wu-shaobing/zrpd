# 系统 TTS 集成（tts-rs + Tauri）

目标：在不依赖外部网络服务的前提下，使用操作系统自带语音引擎实现中文/英文的稳定播报，作为运行时兜底能力。

## 依赖与平台

- Rust crate：tts（https://github.com/ndarilek/tts-rs）
- 平台映射：
  - macOS: NSSpeechSynthesizer（内置多语言，如 Tingting/Mei-Jia 等中文、Samantha 等英文）
  - Windows: SAPI5
  - Linux: Speech Dispatcher

## Cargo 依赖

在 `src-tauri/Cargo.toml`：

```toml
[dependencies]
tauri = { version = "2", features = ["protocol-asset"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
once_cell = "1"
parking_lot = "0.12"
tts = "*" # 版本以 crates.io 最新为准
```

## 命令设计

- tts_list_voices() -> [{ id, name, lang, gender? }]
- tts_speak_system(text, { lang?, voice?, rate?, pitch? }) -> Ok
- tts_capability() -> { ok: bool, langs: string[] }

速率/音调：前端统一 0.5–2.0；后端映射到各平台可接受范围。

## 参考实现（示意）

```rust
// path: src-tauri/src/tts_system.rs
use anyhow::{anyhow, Result};
use once_cell::sync::Lazy;
use parking_lot::Mutex;
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize, Clone)]
pub struct VoiceInfo { pub id: String, pub name: String, pub lang: String, pub gender: Option<String> }

static TTS: Lazy<Arc<Mutex<Option<tts::Tts>>>> = Lazy::new(|| Arc::new(Mutex::new(tts::Tts::default().ok())));

pub fn list_voices() -> Result<Vec<VoiceInfo>> {
    let mut guard = TTS.lock();
    if guard.is_none() { *guard = tts::Tts::default().ok(); }
    let t = guard.as_mut().ok_or_else(|| anyhow!("tts init failed"))?;
    let mut out = vec![];
    for v in t.voices()? {
        out.push(VoiceInfo {
            id: v.id.clone().unwrap_or_default(),
            name: v.name.clone().unwrap_or_default(),
            lang: v.language.clone().unwrap_or_default(),
            gender: v.gender.clone(),
        });
    }
    Ok(out)
}

pub fn speak(text: &str, lang: Option<&str>, voice: Option<&str>, rate: Option<f32>, pitch: Option<f32>) -> Result<()> {
    if text.trim().is_empty() { return Ok(()); }
    let mut guard = TTS.lock();
    if guard.is_none() { *guard = tts::Tts::default().ok(); }
    let t = guard.as_mut().ok_or_else(|| anyhow!("tts init failed"))?;

    if let Some(lang) = lang { if let Some(v) = pick_voice_by_lang(t, lang)? { t.set_voice(&v)?; }}
    if let Some(voice) = voice { t.set_voice_name(voice).ok(); }

    // 将 0.5–2.0 映射到各平台范围（示意）
    if let Some(r) = rate { let _ = t.set_rate((r.clamp(0.5,2.0) - 1.0) * 100.0); }
    if let Some(p) = pitch { let _ = t.set_pitch((p.clamp(0.5,2.0) - 1.0) * 10.0); }

    t.speak(text, false)?; // 非阻塞/可由库决定
    Ok(())
}

fn pick_voice_by_lang(t: &mut tts::Tts, lang: &str) -> Result<String> {
    let target = lang.to_lowercase();
    for v in t.voices()? {
        if let Some(l) = v.language.as_ref() {
            if l.to_lowercase().starts_with(&target) { return Ok(v.id.unwrap_or_default()); }
        }
    }
    Err(anyhow!("no voice for lang"))
}
```

```rust
// path: src-tauri/src/commands.rs
use serde::Serialize;

#[tauri::command]
pub fn tts_list_voices() -> Result<Vec<crate::tts_system::VoiceInfo>, String> {
    crate::tts_system::list_voices().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tts_speak_system(text: String, lang: Option<String>, voice: Option<String>, rate: Option<f32>, pitch: Option<f32>) -> Result<(), String> {
    crate::tts_system::speak(&text, lang.as_deref(), voice.as_deref(), rate, pitch).map_err(|e| e.to_string())
}

#[derive(Serialize)]
pub struct Capability { ok: bool, langs: Vec<String> }

#[tauri::command]
pub fn tts_capability() -> Result<Capability, String> {
    let voices = crate::tts_system::list_voices().map_err(|e| e.to_string())?;
    let mut langs = voices.iter().map(|v| v.lang.split('-').next().unwrap_or("").to_string()).collect::<Vec<_>>();
    langs.sort(); langs.dedup();
    Ok(Capability { ok: !voices.is_empty(), langs })
}
```

前端调用与降级：
- 优先在前端传入 lang（'zh-CN'|'en-US'）；若未指定则由后端挑选默认音色。
- 如返回错误（无匹配音色），前端降级到 Piper/音频 sprite。

## 验收要点（中/英）

- macOS：确保“系统偏好设置 > 辅助功能 > 朗读内容 > 系统语音”已安装中文（如 Tingting）与英文（如 Samantha）。
- 调用 tts_list_voices()，检查是否包含 zh 与 en 前缀的语音。
- 分别播报中文、英文短句，确认发音正确、速度合适，无明显截断。
