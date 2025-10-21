// Tauri backend TTS system module

pub mod tts_system;

use serde::Serialize;

#[derive(Serialize)]
pub struct Capability {
    pub ok: bool,
    pub langs: Vec<String>,
}
