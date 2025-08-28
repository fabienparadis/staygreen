# Stay Green Desktop App - PRD

## 📋 Product Overview

**Product Name:** Stay Green  
**Version:** 1.0.0  
**Platform:** Desktop (Windows, macOS)  
**Framework:** Electron + Next.js

### Problem Statement

Users need to maintain "available" status on communication platforms (Teams, Slack, Discord, etc.) without manually moving their mouse or adjusting system settings. Current solutions are unreliable, visible, or require administrative privileges.

### Solution

A privacy-first desktop application that simulates minimal system activity (Caps Lock toggle) to prevent idle/away status across all applications while remaining completely hidden and undetectable.

## 🎯 Core Features

### MVP Features

1. **Status Toggle** - One-click start/stop functionality
2. **Hidden Operation** - Runs silently via PowerShell + VBS scripts
3. **System Tray Integration** - Minimalist taskbar presence
4. **Activity Simulation** - Caps Lock toggle every 5 minutes
5. **Privacy First** - No network requests, local storage only

### Future Features (V2+) - don't work on that yet.

- Custom interval settings (1-30 minutes)
- Smart pause detection (active typing)
- Activity logs and statistics
- Auto-start with system option
- Different simulation methods

## 🏗️ Technical Architecture

### Tech Stack

```
Frontend:    Next.js + React + TypeScript
Styling:     Tailwind CSS + Shadcn/ui components
Desktop:     Electron (latest stable)
Backend:     Node.js (embedded in Electron)
Scripts:     PowerShell + VBS
State:       Local storage (electron-store)
Build:       electron-builder
```

### Project Structure

```
stay-green-app/
├── electron/
│   ├── main.js              # Main Electron process
│   ├── preload.js           # IPC bridge
│   └── scripts/
│       ├── stay-active.ps1  # PowerShell activity script
│       └── runner.vbs       # Silent VBS wrapper
├── src/ (i am not using src folder FYI directly app)
│   ├── app/
│   │   ├── page.tsx         # Main app interface
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── ToggleButton.tsx # Main control
│   │   ├── StatusIndicator.tsx
│   │   ├── TrayIcon.tsx
│   │   └── SettingsPanel.tsx
│   ├── lib/
│   │   ├── electron-api.ts  # IPC type definitions
│   │   └── utils.ts         # Helper functions
│   └── types/
│       └── index.ts         # TypeScript definitions
├── public/
│   ├── icons/               # App icons (16x16, 32x32, 256x256)
│   └── tray-icons/         # Tray status icons
├── package.json
├── electron-builder.json   # Build configuration
├── next.config.js
└── tailwind.config.js
```

## 🎨 User Interface Design

### Main Window (280x400px)

```
┌─────────────────────────────┐
│  🟢 Stay Green             │
│                             │
│    ┌─────────────────┐     │
│    │                 │     │
│    │   ● ACTIVE      │     │
│    │                 │     │
│    │  [  TOGGLE  ]   │     │
│    │                 │     │
│    └─────────────────┘     │
│                             │
│  Next toggle: 4m 32s       │
│  Session time: 2h 15m      │
│                             │
│  ⚙️ Settings               │
└─────────────────────────────┘
```

### System Tray

- **Green dot**: Active/running
- **Gray dot**: Inactive/stopped
- **Context menu**: Show/Hide, Start/Stop, Quit

### Color Scheme

```
Primary: #10b981 (emerald-500) - Active green
Secondary: #6b7280 (gray-500) - Inactive
Background: #ffffff (white) - Clean minimal
Text: #111827 (gray-900) - High contrast
Accent: #3b82f6 (blue-500) - Interactive elements
```

## 🔧 Core Functionality

### Script Execution Logic

```powershell
# stay-active.ps1
Add-Type -AssemblyName System.Windows.Forms
while ($true) {
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Milliseconds 50
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Seconds 300  # 5 minutes
}
```

```vb
' runner.vbs - Silent execution wrapper
CreateObject("Wscript.Shell").Run "powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File stay-active.ps1", 0
```

### Electron IPC API

```typescript
// Exposed APIs via preload.js
interface ElectronAPI {
  startStayGreen: () => Promise<boolean>;
  stopStayGreen: () => Promise<boolean>;
  getStatus: () => Promise<AppStatus>;
  minimizeToTray: () => void;
  showFromTray: () => void;
  onStatusChange: (callback: (status: AppStatus) => void) => void;
}
```

### State Management

```typescript
interface AppStatus {
  isActive: boolean;
  startTime?: Date;
  lastToggle?: Date;
  sessionDuration: number;
  nextToggleIn: number;
}
```

## 🔒 Privacy & Security Requirements

### Privacy Principles

- **Zero telemetry** - No data collection or analytics
- **Local-only storage** - All settings stored locally
- **No network requests** - Completely offline operation
- **Minimal permissions** - Only required system access
- **Open source ready** - Transparent codebase

### Security Measures

- **Sandboxed renderer** - Secure Electron configuration
- **Limited IPC exposure** - Only necessary APIs exposed
- **Script validation** - Verify PowerShell script integrity
- **Process isolation** - Separate script execution context

## 🚀 Development Phases

### Phase 1: Core MVP

- [ ] Basic Electron + Next.js setup
- [ ] Main window with toggle functionality
- [ ] PowerShell script integration
- [ ] System tray implementation
- [ ] Basic start/stop functionality

### Phase 2: Polish & UX

- [ ] Improved UI/UX with animations
- [ ] Status indicators and timers
- [ ] Error handling and notifications
- [ ] Auto-minimize to tray
- [ ] Settings persistence

### Phase 3: Distribution

- [ ] Build pipeline setup
- [ ] Icon and branding finalization
- [ ] Installer creation (Windows/Mac)
- [ ] Testing across platforms
- [ ] Documentation and README

## 📊 Success Metrics

### Technical KPIs

- App startup time: < 3 seconds
- Memory usage: < 150MB
- CPU usage: < 1% when active
- Battery impact: Minimal (< 1% per hour)

### User Experience KPIs

- One-click activation: 100% success rate
- Hidden operation: Completely undetectable
- Cross-platform compatibility: Windows/Mac
- Reliability: 99.9% uptime during active sessions

## 🔧 Installation & Setup

### User Installation

- **Windows**: StayGreen-Setup-1.0.0.exe
- **macOS**: StayGreen-1.0.0.dmg

## 📋 Acceptance Criteria

### Core Functionality

- [ ] App launches and displays main interface
- [ ] Toggle button starts/stops activity simulation
- [ ] PowerShell script runs hidden without console windows
- [ ] Caps Lock toggles every 5 minutes when active
- [ ] System tray icon reflects current status
- [ ] App can be minimized to tray and restored
- [ ] Settings are persisted between sessions

### Cross-Platform Requirements

- [ ] Works on Windows 10/11
- [ ] Works on macOS 10.15+
- [ ] No admin privileges required
- [ ] Consistent behavior across platforms

### Performance Requirements

- [ ] Minimal system resource usage
- [ ] No interference with other applications
- [ ] Reliable script execution
- [ ] Graceful error handling

---
