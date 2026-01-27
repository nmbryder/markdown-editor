use markdown2pdf::config::ConfigSource;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn export_pdf(content: String, file_path: String) -> Result<(), String> {
    // Try markdown2pdf first (pure Rust)
    let mdp_result =
        markdown2pdf::parse_into_file(content.clone(), &file_path, ConfigSource::Default, None);

    match mdp_result {
        Ok(_) => Ok(()),
        Err(e) => {
            let err_msg = e.to_string();
            if err_msg.contains("Unmatched emphasis") {
                // Try fallback to pandoc if available
                let mut pandoc = pandoc::new();
                pandoc.set_input(pandoc::InputKind::Pipe(content));
                pandoc.set_output(pandoc::OutputKind::File(file_path.into()));

                match pandoc.execute() {
                    Ok(_) => Ok(()),
                    Err(pe) => Err(format!(
                        "❌ Markdown Parsing Error: {}\n\n💡 Suggestion: Verify your Markdown syntax is valid (matching * or _). Pandoc also failed: {}", 
                        err_msg, pe.to_string()
                    ))
                }
            } else {
                Err(format!("Failed to export PDF: {}", err_msg))
            }
        }
    }
}

#[tauri::command]
fn export_docx(content: String, file_path: String) -> Result<(), String> {
    let mut pandoc = pandoc::new();
    pandoc.set_input(pandoc::InputKind::Pipe(content));
    pandoc.set_output(pandoc::OutputKind::File(file_path.into()));
    pandoc.execute().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, export_pdf, export_docx])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
