// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use zrpd_lib::{tts_system, Capability};

#[tauri::command]
fn tts_list_voices() -> Result<Vec<tts_system::VoiceInfo>, String> {
    tts_system::list_voices().map_err(|e| e.to_string())
}

#[tauri::command]
fn tts_speak_system(
    text: String,
    lang: Option<String>,
    voice: Option<String>,
    rate: Option<f32>,
    pitch: Option<f32>,
) -> Result<(), String> {
    let cleaned = text.trim().replace(['\n', '\r', '\t'], " ");
    if cleaned.is_empty() || cleaned.len() > 200 {
        return Err("invalid text".into());
    }
    tts_system::speak(&cleaned, lang.as_deref(), voice.as_deref(), rate, pitch)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn tts_capability() -> Result<Capability, String> {
    let (ok, langs) = tts_system::capability().map_err(|e| e.to_string())?;
    Ok(Capability { ok, langs })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            tts_list_voices,
            tts_speak_system,
            tts_capability
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
