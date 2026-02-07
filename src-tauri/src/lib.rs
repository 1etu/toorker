mod commands;

use commands::{port_scanner, process_manager};
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        if let Some(win) = app.get_webview_window("palette") {
                            let is_visible = win.is_visible().unwrap_or(false);
                            if is_visible {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                                let _ = win.center();
                            }
                        }
                    }
                })
                .build(),
        )
        .on_window_event(|window, event| {
            if window.label() == "main" {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    std::process::exit(0);
                }
            }
        })
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::GlobalShortcutExt;
                app.global_shortcut()
                    .register("CommandOrControl+K")
                    .expect("failed to register global shortcut");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            port_scanner::scan_all_listening_ports,
            port_scanner::kill_by_port,
            port_scanner::get_network_overview,
            process_manager::list_processes,
            process_manager::kill_process,
        ])
        .run(tauri::generate_context!())
        .expect("err while runnning");
}
