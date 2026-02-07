use serde::Serialize;
use std::collections::HashMap;
use std::process::{Command, Stdio};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Serialize, Clone)]
pub struct PortEntry {
    pub port: u16,
    pub protocol: String,
    pub pid: u32,
    pub process_name: String,
    pub executable_path: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct NetworkOverview {
    pub local_ip: String,
    pub hostname: String,
}

#[tauri::command]
pub async fn scan_all_listening_ports() -> Result<Vec<PortEntry>, String> {
    let port_pid = collect_listening_ports()?;
    let pid_details = collect_process_details()?;

    let mut entries: Vec<PortEntry> = port_pid
        .into_iter()
        .map(|(port, (pid, protocol))| {
            let details = pid_details.get(&pid);
            PortEntry {
                port,
                protocol,
                pid,
                process_name: details
                    .map(|d| d.name.clone())
                    .unwrap_or_else(|| "Unknown".into()),
                executable_path: details.and_then(|d| d.exe_path.clone()),
            }
        })
        .collect();

    entries.sort_unstable_by_key(|e| e.port);
    Ok(entries)
}

#[tauri::command]
pub async fn kill_by_port(port: u16) -> Result<String, String> {
    let port_pid = collect_listening_ports()?;

    let (pid, _) = port_pid
        .get(&port)
        .ok_or_else(|| format!("No process found on port {}", port))?;

    kill_pid(*pid)?;
    Ok(format!("Killed PID {} on port {}", pid, port))
}

#[tauri::command]
pub async fn get_network_overview() -> Result<NetworkOverview, String> {
    let local_ip = detect_local_ip()?;
    let hostname = detect_hostname();

    Ok(NetworkOverview {
        local_ip,
        hostname,
    })
}

fn collect_listening_ports() -> Result<HashMap<u16, (u32, String)>, String> {
    let mut cmd = Command::new("netstat");
    cmd.arg("-ano")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to run netstat: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut map: HashMap<u16, (u32, String)> = HashMap::new();

    for line in stdout.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 5 || !line.contains("LISTENING") {
            continue;
        }

        let protocol = if parts[0].eq_ignore_ascii_case("TCP") {
            "TCP"
        } else if parts[0].eq_ignore_ascii_case("UDP") {
            "UDP"
        } else {
            continue;
        };

        if let Some(port) = extract_port(parts[1]) {
            if let Ok(pid) = parts[4].parse::<u32>() {
                map.entry(port).or_insert((pid, protocol.to_string()));
            }
        }
    }

    Ok(map)
}

struct ProcessDetail {
    name: String,
    exe_path: Option<String>,
}

fn collect_process_details() -> Result<HashMap<u32, ProcessDetail>, String> {
    let names = collect_process_names()?;
    let paths = collect_exe_paths();

    let mut map = HashMap::new();
    for (pid, name) in &names {
        map.insert(
            *pid,
            ProcessDetail {
                name: name.clone(),
                exe_path: paths.get(pid).cloned(),
            },
        );
    }

    Ok(map)
}

fn collect_process_names() -> Result<HashMap<u32, String>, String> {
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
    let mut map = HashMap::new();

    for line in stdout.lines() {
        let fields: Vec<&str> = line.split(',').map(|f| f.trim_matches('"')).collect();
        if fields.len() >= 2 {
            if let Ok(pid) = fields[1].parse::<u32>() {
                map.insert(pid, fields[0].to_string());
            }
        }
    }

    Ok(map)
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

fn kill_pid(pid: u32) -> Result<(), String> {
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
        Ok(())
    } else {
        Err(format!("Failed to kill PID {}", pid))
    }
}

fn extract_port(addr: &str) -> Option<u16> {
    addr.rsplit(':').next()?.parse().ok()
}

fn detect_local_ip() -> Result<String, String> {
    use std::net::UdpSocket;

    let socket =
        UdpSocket::bind("0.0.0.0:0").map_err(|e| format!("Socket bind failed: {}", e))?;

    socket
        .connect("8.8.8.8:80")
        .map_err(|e| format!("Connect failed: {}", e))?;

    Ok(socket
        .local_addr()
        .map_err(|e| format!("local_addr failed: {}", e))?
        .ip()
        .to_string())
}

fn detect_hostname() -> String {
    let mut cmd = Command::new("hostname");
    cmd.stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    match cmd.output() {
        Ok(output) => String::from_utf8_lossy(&output.stdout).trim().to_string(),
        Err(_) => "unknown".to_string(),
    }
}
