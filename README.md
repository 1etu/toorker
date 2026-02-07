<div align="center">
  <h1>Toorker</h1>
  <p><strong>Developer toolkit — built by developers, for developers.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
  [![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/1etu/toorker/releases)
  [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

  <img width="1920" height="1080" alt="frWjPGhTL2" src="https://github.com/user-attachments/assets/e7e32383-c471-4dea-a72b-978dcd6a6744" />


</div>

---

## Overview

Toorker is a utility-first desktop application that consolidates essential developer tools into a single, fast, and beautiful interface. Built with Tauri, React 19, and TypeScript - which offers native performance.

### Philosophy

- **Utility-first**: Every feature is designed for maximum productivity
- **Native performance**: Powered by Rust/Tauri for sub-50ms startup times
- **Keyboard-driven**: Full keyboard navigation with customizable shortcuts
- **Privacy-first**: Everything runs locally — no data leaves your machine

---

## Features

### System Tools
- **Ports Monitor** — Monitor listening ports, identify services, and terminate processes
- **Process Manager** — View running processes, memory usage, and system stats
- **API Tester** — Send HTTP requests, inspect responses, export as cURL/code snippets

### Converters
- **Number Base** — Convert between decimal, hex, octal, and binary
- **Date Converter** — Transform Unix timestamps to human-readable dates
- **Color Converter** — Convert between HEX, RGB, and HSL color formats
- **Cron Parser** — Parse and understand cron expressions
- **YAML / JSON / TOML** — Convert between YAML, JSON, and TOML with auto-detection

### Formatters & Encoders
- **JSON Formatter** — Format, minify, and validate JSON
- **Markdown Preview** — Live Markdown rendering
- **Base64 Encoder** — Encode/decode Base64 strings
- **URL Encoder** — Encode/decode URL components
- **HTML Encoder** — Encode/decode HTML entities
- **JWT Decoder** — Decode and inspect JWT tokens

### Generators
- **UUID Generator** — Generate v4 UUIDs
- **Hash Generator** — Generate MD5, SHA-1, SHA-256, SHA-512 hashes
- **Password Generator** — Generate secure random passwords with configurable options
- **Lorem Ipsum** — Generate placeholder text with multiple corpuses (Classic Latin, Hipster, Tech, Space, Pirate), line numbers, and export
- **QR Code Generator** — Generate QR codes from text, URLs, WiFi credentials, email, and phone numbers with full customization (colors, size, error correction) and PNG export
- **Gradient Builder** — Create CSS/Tailwind gradients with live preview

### Text Tools
- **Regex Tester** — Test regular expressions with live highlighting
- **Text Diff** — Compare two texts and highlight differences

---

## Smart Actions (TSF)

Press `Ctrl+K` to open the command palette. Beyond searching tools and ports, it provides **instant smart actions** — type a query and get results immediately, copied to your clipboard.

### Calculations

| Input | Result |
|-------|--------|
| `= 2 + 3 * 4` | `14` |
| `calc sqrt(144)` | `12` |
| `= 20% of 500` | `100` |
| `= sin(pi / 2)` | `1` |
| `128 + 256` | `384` |

Supports: `+` `-` `*` `/` `^` `%`, functions (`sqrt`, `sin`, `cos`, `tan`, `log`, `abs`, `ceil`, `floor`, `round`, `pow`...), constants (`pi`, `tau`, `e`), and percentages.

### Generate & Convert

| Input | Action |
|-------|--------|
| `uuid` | Generate a UUID |
| `5 uuid` | Generate 5 UUIDs |
| `password` / `strong password 32` | Generate password(s) |
| `lorem 3 paragraphs` | Generate Lorem Ipsum text |
| `lorem tech 5 sentences` | Generate Tech Ipsum |
| `json` / `3 json` | Generate JSON sample objects |
| `base64 encode hello` | Base64 encode |
| `url encode my string` | URL encode |
| `sha256 my text` | Hash text |
| `#FF5500` / `rgb(255, 85, 0)` | Color format conversion |
| `0xFF to decimal` | Number base conversion |
| `now` / `timestamp` | Current Unix timestamp |

### System & Navigation

| Input | Action |
|-------|--------|
| `qr https://example.com` | Open QR Code tool with URL pre-filled |
| `ip` / `my ip` / `public ip` | Fetch & copy your public IP address |
| `open desktop` | Open Desktop folder in file explorer |
| `open downloads` | Open Downloads folder |
| `open C:\path\to\folder` | Open any path in explorer |
| `kill chrome` | Terminate processes by name |
| `json to yaml` / `yaml to toml` | Open data converter |

### Text Manipulation

| Input | Action |
|-------|--------|
| `upper hello world` | → `HELLO WORLD` |
| `lower HELLO` | → `hello` |
| `title hello world` | → `Hello World` |
| `camel hello world` | → `helloWorld` |
| `snake myVariable` | → `my_variable` |
| `kebab myVariable` | → `my-variable` |
| `pascal hello world` | → `HelloWorld` |
| `constant myVar` | → `MY_VAR` |
| `reverse hello` | → `olleh` |
| `count some text here` | → `3 words, 14 characters, 1 lines` |
| `rand 1 100` | Random number in range |
| `random color` | Random hex color |

---

## Installation

### Download Pre-built Binaries

Download the latest release for your platform:

#### Windows

**Option 1: Windows Package Manager (Winget)** — Recommended

```powershell
winget install 1etu.Toorker
```

**Option 2: Direct Download**

- `Toorker_0.1.0_x64-setup.exe` (NSIS installer)
- `Toorker_0.1.0_x64_en-US.msi` (MSI installer)

#### macOS & Linux

- **macOS**: `Toorker_0.1.0_x64.dmg` (coming soon)
- **Linux**: `Toorker_0.1.0_amd64.deb` or `Toorker_0.1.0_amd64.AppImage` (coming soon)

[→ Download from Releases](https://github.com/1etu/toorker/releases)

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (latest stable)
- Platform-specific dependencies:
  - **Windows**: Visual Studio Build Tools, WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.0-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

#### Steps

```bash
# Clone the repository
git clone https://github.com/1etu/toorker.git
cd toorker

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

Built artifacts will be in `src-tauri/target/release/bundle/`.

---

## Usage

### Keyboard Shortcuts

All keyboard shortcuts are customizable in Settings (`Ctrl+,`).

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+1-9` | Switch between tools |
| `Ctrl+,` | Open settings |
| `Esc` | Close command palette |

### Command Palette Examples

```
= 2 + 3 * 4            → Inline calculation (14)
uuid                    → Generate a UUID
strong password 32      → Generate a 32-char strong password
qr https://example.com  → Generate QR code
ip                      → Fetch your public IP
open desktop            → Open Desktop in file explorer
upper hello world       → HELLO WORLD
camel my variable       → myVariable
kill chrome             → Terminate Chrome process
lorem tech 3 sentences  → Generate Tech Ipsum
rand 1 100              → Random number in range
json to yaml            → Open data converter
```

---

## Auto-Updates

Toorker includes a built-in auto-updater powered by Tauri's updater plugin. Updates are:

- **Secure**: Cryptographically signed with Ed25519
- **Non-intrusive**: Checks on launch (optional, can be disabled)
- **User-controlled**: You choose when to install

Configure auto-update preferences in Settings → Updates.

---

## Architecture

```
toorker/
├── src/                          # Frontend (React + TypeScript)
│   ├── features/                 # Feature modules (tools)
│   │   ├── ports/
│   │   ├── processes/
│   │   ├── api-tester/
│   │   ├── qr-code/
│   │   ├── data-converter/
│   │   ├── lorem-ipsum/
│   │   ├── tsf/                  # Smart command palette
│   │   └── ...
│   ├── components/               # Shared UI components
│   ├── lib/                      # Utilities and tool registry
│   └── stores/                   # Zustand state management
│
├── src-tauri/                    # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── commands/             # IPC command handlers
│   │   │   ├── port_scanner.rs
│   │   │   └── process_manager.rs
│   │   └── lib.rs                # Main entry point
│   └── Cargo.toml
│
└── public/                       # Static assets
```

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Zustand
- **Backend**: Rust, Tauri 2
- **Build**: Vite, esbuild
- **Design**: utility-first

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dependencies
npm install

# Run dev server (with hot reload)
npm run tauri dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run tauri build
```

---

## Security

### Reporting Security Issues

If you discover a security vulnerability, please email security@toorker.dev. Do not open a public issue.

### Key Management

- Private signing keys (`*.key`) are **never** committed to the repository
- Public keys (`*.key.pub`) are safe to commit
- The `.gitignore` is configured to prevent accidental key exposure

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Roadmap

See [FEATURE_IDEAS.md](FEATURE_IDEAS.md) for planned features and future development.

---

## Acknowledgments

Built with:
- [Tauri](https://tauri.app/) — Cross-platform desktop framework
- [React](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Lucide Icons](https://lucide.dev/) — Beautiful icons
- [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight state management

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/1etu">1etu</a></p>
  <p>
    <a href="https://github.com/1etu/toorker">GitHub</a> •
    <a href="https://github.com/1etu/toorker/issues">Report Bug</a> •
    <a href="https://github.com/1etu/toorker/issues">Request Feature</a>
  </p>
</div>
