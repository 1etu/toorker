use serde::Serialize;
use std::collections::HashMap;
use std::process::{Command, Stdio};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory_kb: u64,
    pub executable_path: Option<String>,
}

#[tauri::command]
pub async fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    let exe_paths = collect_exe_paths();

    let mut cmd = Command::new("tasklist");
    cmd.args(["/FO", "CSV", "/NH"])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to run tasklist: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut processes: Vec<ProcessInfo> = stdout
        .lines()
        .filter_map(|line| {
            let fields: Vec<&str> = line.split(',').map(|f| f.trim_matches('"')).collect();
            if fields.len() < 5 {
                return None;
            }

            let pid = fields[1].parse::<u32>().ok()?;
            if pid == 0 {
                return None;
            }

            Some(ProcessInfo {
                pid,
                name: fields[0].to_string(),
                memory_kb: parse_memory(fields[4]),
                executable_path: exe_paths.get(&pid).cloned(),
            })
        })
        .collect();

    processes.sort_unstable_by(|a, b| b.memory_kb.cmp(&a.memory_kb));
    Ok(processes)
}

#[tauri::command]
pub async fn kill_process(pid: u32) -> Result<String, String> {
    let mut cmd = Command::new("taskkill");
    cmd.args(["/PID", &pid.to_string(), "/F"])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let status = cmd
        .status()
        .map_err(|e| format!("taskkill failed: {}", e))?;

    if status.success() {
        Ok(format!("Killed PID {}", pid))
    } else {
        Err(format!("Failed to kill PID {}", pid))
    }
}


fn collect_exe_paths() -> HashMap<u32, String> {
    let mut cmd = Command::new("wmic");
    cmd.args(["process", "get", "ProcessId,ExecutablePath", "/FORMAT:CSV"])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = match cmd.output() {
        Ok(o) => o,
        Err(_) => return HashMap::new(),
    };

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut map = HashMap::new();

    for line in stdout.lines().skip(1) {
        let fields: Vec<&str> = line.split(',').collect();
        if fields.len() >= 3 {
            let exe = fields[1].trim();
            let pid_str = fields[2].trim();
            if let Ok(pid) = pid_str.parse::<u32>() {
                if !exe.is_empty() {
                    map.insert(pid, exe.to_string());
                }
            }
        }
    }

    map
}

fn parse_memory(s: &str) -> u64 {
    s.chars()
        .filter(|c| c.is_ascii_digit())
        .collect::<String>()
        .parse()
        .unwrap_or(0)
}
