// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

/// Speak text using macOS say command (fallback for Web Speech API)
#[tauri::command]
async fn speak_text(text: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        
        // Validate input length
        if text.len() > 200 {
            return Err("Text too long (max 200 chars)".to_string());
        }
        
        // Filter invalid characters
        let safe_text: String = text.chars()
            .filter(|c| c.is_alphanumeric() || c.is_whitespace() || "/-.,!?'\"()[]".contains(*c))
            .collect();
        
        if safe_text.is_empty() {
            return Err("Invalid text input".to_string());
        }
        
        match Command::new("say")
            .arg("-v")
            .arg("Alex")
            .arg(&safe_text)
            .spawn()
        {
            Ok(_) => Ok(format!("Speaking: {}", safe_text)),
            Err(e) => Err(format!("Failed to execute say command: {}", e)),
        }
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Err("Speech synthesis only available on macOS".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![speak_text])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
