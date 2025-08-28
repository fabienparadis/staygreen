const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Stay Green control
  startStayGreen: () => ipcRenderer.invoke("start-stay-green"),
  stopStayGreen: () => ipcRenderer.invoke("stop-stay-green"),
  getStatus: () => ipcRenderer.invoke("get-status"),

  // Window management
  minimizeToTray: () => ipcRenderer.invoke("minimize-to-tray"),
  showFromTray: () => ipcRenderer.invoke("show-from-tray"),

  // Status change listener
  onStatusChange: (callback) => {
    ipcRenderer.on("status-changed", (event, status) => callback(status));
  },

  // Remove listener
  removeStatusListener: () => {
    ipcRenderer.removeAllListeners("status-changed");
  },
});
