# Stay Green Desktop App

A privacy-first desktop application that simulates minimal system activity to prevent idle/away status across communication platforms (Teams, Slack, Discord, etc.) while remaining completely hidden and undetectable.

## 🎯 Features

- **One-click activation** - Start/stop with a single button click
- **Hidden operation** - Runs silently via PowerShell + VBS scripts
- **System tray integration** - Minimalist taskbar presence
- **Activity simulation** - Caps Lock toggle every 5 minutes
- **Privacy first** - No network requests, local storage only
- **Cross-platform** - Works on Windows and macOS

## 🏗️ Tech Stack

- **Frontend**: Next.js + React + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Desktop**: Electron (latest stable)
- **Backend**: Node.js (embedded in Electron)
- **Scripts**: PowerShell + VBS
- **State**: Local storage (electron-store)
- **Build**: electron-builder

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Windows or macOS for testing

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd staygreen
```

2. Install dependencies:

```bash
npm install
```

3. Start development mode:

```bash
# Web development (browser mode)
npm run dev

# Electron development (desktop app)
npm run electron-dev
```

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js app for production
- `npm run electron-dev` - Start Electron in development mode
- `npm run electron` - Start Electron with built app
- `npm run dist` - Build and package for distribution

## 📦 Building for Distribution

### Windows

```bash
npm run dist
```

Creates: `dist/Stay Green Setup 1.0.0.exe`

### macOS

```bash
npm run dist
```

Creates: `dist/Stay Green-1.0.0.dmg`

## 🔧 How It Works

1. **Activity Simulation**: The app uses PowerShell scripts to toggle Caps Lock every 5 minutes
2. **Silent Execution**: VBS wrapper ensures no console windows appear
3. **System Tray**: App runs in background with tray icon for status
4. **Privacy**: All operations are local, no data collection or network requests

### Script Details

**PowerShell Script** (`stay-active.ps1`):

```powershell
Add-Type -AssemblyName System.Windows.Forms
while ($true) {
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Milliseconds 50
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Seconds 300
}
```

**VBS Wrapper** (`runner.vbs`):

```vb
CreateObject("Wscript.Shell").Run "powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File stay-active.ps1", 0
```

## 🎨 UI Components

- **ToggleButton**: Main control for starting/stopping activity
- **StatusIndicator**: Visual status with timer information
- **SettingsPanel**: Future settings (currently placeholder)

## 🔒 Privacy & Security

- **Zero telemetry** - No data collection or analytics
- **Local-only storage** - All settings stored locally
- **No network requests** - Completely offline operation
- **Minimal permissions** - Only required system access
- **Open source ready** - Transparent codebase

## 📋 Project Structure

```
staygreen/
├── electron/
│   ├── main.js              # Main Electron process
│   ├── preload.js           # IPC bridge
│   └── scripts/             # PowerShell & VBS scripts
├── app/
│   ├── page.tsx             # Main app interface
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Shadcn components
│   ├── ToggleButton.tsx     # Main control
│   ├── StatusIndicator.tsx  # Status display
│   └── SettingsPanel.tsx    # Settings panel
├── lib/
│   ├── electron-api.ts      # IPC type definitions
│   └── utils.ts             # Helper functions
├── public/
│   ├── icons/               # App icons
│   └── tray-icons/          # Tray status icons
└── package.json
```

## 🚧 Future Features (V2+)

- Custom interval settings (1-30 minutes)
- Smart pause detection (active typing)
- Activity logs and statistics
- Auto-start with system option
- Different simulation methods

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Stay Green** - Keep your status active, stay productive! 🟢
