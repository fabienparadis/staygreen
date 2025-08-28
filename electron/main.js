const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  shell,
  nativeImage,
} = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// Resolve assets in dev (from project) and in packaged app (from resources)
function assetPath(...parts) {
  return app && app.isPackaged
    ? path.join(process.resourcesPath, ...parts)
    : path.join(__dirname, "..", ...parts);
}

let mainWindow;
let tray;
let stayGreenProcess = null;
let isActive = false;
let startTime = null;

// App status tracking
let appStatus = {
  isActive: false,
  startTime: null,
  lastToggle: null,
  sessionDuration: 0,
  nextToggleIn: 300, // 5 minutes in seconds
};

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 280,
    height: 400,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    // Use app icon (works in dev and packaged)
    icon: assetPath("public", "icons", "app-icon.png"),
    titleBarStyle: "hidden",
    frame: false,
    transparent: true,
  });

  // Load the app
  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Prevent window from being closed, minimize to tray instead
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Create system tray
function createTray() {
  const inactivePath = assetPath("public", "tray-icons", "tray-inactive.png");
  const hasInactive = fs.existsSync(inactivePath);
  const fallbackImage = nativeImage.createEmpty();
  tray = new Tray(hasInactive ? inactivePath : fallbackImage);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isActive ? "Stop Stay Green" : "Start Stay Green",
      click: () => {
        if (isActive) {
          stopStayGreen();
        } else {
          startStayGreen();
        }
      },
    },
    { type: "separator" },
    {
      label: "Show/Hide",
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        if (stayGreenProcess) {
          stopStayGreen();
        }
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Stay Green");

  // Handle tray click
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Start Stay Green activity
async function startStayGreen() {
  if (isActive) return false;

  try {
    const scriptsDir = path.join(__dirname, "scripts");
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    const scriptPath = path.join(scriptsDir, "stay-active.ps1");

    // Create PowerShell script if it doesn't exist
    if (!fs.existsSync(scriptPath)) {
      const scriptContent = `Add-Type -AssemblyName System.Windows.Forms
while ($true) {
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Milliseconds 50
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Seconds 300
}`;
      fs.writeFileSync(scriptPath, scriptContent);
    }

    // On Windows, launch via VBS for hidden window; on other OSes, no-op
    if (process.platform === "win32") {
      const vbsPath = path.join(scriptsDir, "runner.vbs");
      const vbsContent = `CreateObject("Wscript.Shell").Run "powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}"", 0`;
      fs.writeFileSync(vbsPath, vbsContent);
      stayGreenProcess = spawn("wscript.exe", [vbsPath], {
        detached: true,
        stdio: "ignore",
      });
    }

    isActive = true;
    startTime = new Date();
    appStatus = {
      isActive: true,
      startTime: startTime,
      lastToggle: new Date(),
      sessionDuration: 0,
      nextToggleIn: 300,
    };

    // Update tray icon
    const activeIconPath = assetPath("public", "tray-icons", "tray-active.png");
    if (fs.existsSync(activeIconPath)) {
      tray.setImage(activeIconPath);
    }

    // Start status update timer
    startStatusTimer();

    // Notify renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("status-changed", appStatus);
    }

    return true;
  } catch (error) {
    console.error("Failed to start Stay Green:", error);
    return false;
  }
}

// Stop Stay Green activity
async function stopStayGreen() {
  if (!isActive) return false;

  try {
    // Kill the PowerShell process
    if (stayGreenProcess) {
      stayGreenProcess.kill();
      stayGreenProcess = null;
    }

    // Kill any remaining PowerShell processes related to our script
    const { exec } = require("child_process");
    exec(
      'taskkill /f /im powershell.exe /fi "WINDOWTITLE eq *stay-active*"',
      (error) => {
        if (error) {
          console.log("No PowerShell processes to kill");
        }
      }
    );

    isActive = false;
    appStatus = {
      isActive: false,
      startTime: null,
      lastToggle: null,
      sessionDuration: 0,
      nextToggleIn: 300,
    };

    // Update tray icon
    const inactiveIconPath = assetPath(
      "public",
      "tray-icons",
      "tray-inactive.png"
    );
    if (fs.existsSync(inactiveIconPath)) {
      tray.setImage(inactiveIconPath);
    }

    // Stop status timer
    stopStatusTimer();

    // Notify renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("status-changed", appStatus);
    }

    return true;
  } catch (error) {
    console.error("Failed to stop Stay Green:", error);
    return false;
  }
}

// Status update timer
let statusTimer = null;

function startStatusTimer() {
  statusTimer = setInterval(() => {
    if (isActive && startTime) {
      const now = new Date();
      const sessionDuration = Math.floor((now - startTime) / 1000);
      const nextToggleIn = 300 - (sessionDuration % 300);

      appStatus = {
        ...appStatus,
        sessionDuration,
        nextToggleIn,
        lastToggle: new Date(now.getTime() - (sessionDuration % 300) * 1000),
      };

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("status-changed", appStatus);
      }
    }
  }, 1000);
}

function stopStatusTimer() {
  if (statusTimer) {
    clearInterval(statusTimer);
    statusTimer = null;
  }
}

// IPC Handlers
ipcMain.handle("start-stay-green", async () => {
  return await startStayGreen();
});

ipcMain.handle("stop-stay-green", async () => {
  return await stopStayGreen();
});

ipcMain.handle("get-status", async () => {
  return appStatus;
});

ipcMain.handle("minimize-to-tray", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle("show-from-tray", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuiting = true;
  if (stayGreenProcess) {
    stopStayGreen();
  }
});

// Handle app quit
app.on("quit", () => {
  if (tray) {
    tray.destroy();
  }
});
