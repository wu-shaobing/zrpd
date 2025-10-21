use anyhow::{anyhow, Result};
use once_cell::sync::Lazy;
use parking_lot::Mutex;
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize, Clone, Debug)]
pub struct VoiceInfo {
    pub id: String,
    pub name: String,
    pub lang: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gender: Option<String>,
}

// 全局 TTS 实例（延迟初始化）
static TTS: Lazy<Arc<Mutex<Option<tts::Tts>>>> =
    Lazy::new(|| Arc::new(Mutex::new(tts::Tts::default().ok())));

/// 列出系统可用语音
pub fn list_voices() -> Result<Vec<VoiceInfo>> {
    let mut guard = TTS.lock();
    if guard.is_none() {
        *guard = tts::Tts::default().ok();
    }
    let tts_instance = guard.as_mut().ok_or_else(|| anyhow!("tts init failed"))?;

    let mut voices = Vec::new();
    for voice in tts_instance.voices()? {
        voices.push(VoiceInfo {
            id: voice.id().to_string(),
            name: voice.name().to_string(),
            lang: voice.language().to_string(),
            gender: voice.gender().map(|g| format!("{:?}", g)),
        });
    }

    Ok(voices)
}

/// 播报文本（支持 lang 自动选择音色）
pub fn speak(
    text: &str,
    lang: Option<&str>,
    voice: Option<&str>,
    rate: Option<f32>,
    pitch: Option<f32>,
) -> Result<()> {
    if text.trim().is_empty() {
        return Ok(());
    }

    let mut guard = TTS.lock();
    if guard.is_none() {
        *guard = tts::Tts::default().ok();
    }
    let tts_instance = guard.as_mut().ok_or_else(|| anyhow!("tts init failed"))?;

    // 根据 lang 自动选择音色
    if let Some(lang_code) = lang {
        if let Ok(selected_voice) = pick_voice_by_lang(tts_instance, lang_code) {
            let _ = tts_instance.set_voice(&selected_voice);
        }
    }

    // 优先使用指定音色名称
    if let Some(voice_name) = voice {
        // 尝试按名称查找
        for v in tts_instance.voices()? {
            if v.name() == voice_name {
                let _ = tts_instance.set_voice(&v);
                break;
            }
        }
    }

    // 设置速率与音调（映射 0.5-2.0 → 平台范围）
    if let Some(r) = rate {
        let normalized = (r.clamp(0.5, 2.0) - 1.0) * 100.0;
        let _ = tts_instance.set_rate(normalized);
    }
    if let Some(p) = pitch {
        let normalized = (p.clamp(0.5, 2.0) - 1.0) * 10.0;
        let _ = tts_instance.set_pitch(normalized);
    }

    tts_instance.speak(text, false)?;
    Ok(())
}

/// 根据语言代码挑选最佳音色（按前缀匹配）
fn pick_voice_by_lang(tts_instance: &mut tts::Tts, lang: &str) -> Result<tts::Voice> {
    let target = lang.to_lowercase();
    for voice in tts_instance.voices()? {
        let voice_lang = voice.language().to_string().to_lowercase();
        if voice_lang.starts_with(&target) {
            return Ok(voice);
        }
    }
    Err(anyhow!("no voice for lang: {}", lang))
}

/// 获取系统能力（可用语言列表）
pub fn capability() -> Result<(bool, Vec<String>)> {
    let voices = list_voices()?;
    let mut langs: Vec<String> = voices
        .iter()
        .filter_map(|v| {
            let lang = v.lang.split('-').next()?.to_string();
            if lang.is_empty() {
                None
            } else {
                Some(lang)
            }
        })
        .collect();
    langs.sort();
    langs.dedup();
    Ok((!voices.is_empty(), langs))
}
