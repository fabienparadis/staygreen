export interface AppStatus {
  isActive: boolean;
  startTime: Date | null;
  lastToggle: Date | null;
  sessionDuration: number;
  nextToggleIn: number;
}

export interface ElectronAPI {
  startStayGreen: () => Promise<boolean>;
  stopStayGreen: () => Promise<boolean>;
  getStatus: () => Promise<AppStatus>;
  minimizeToTray: () => Promise<void>;
  showFromTray: () => Promise<void>;
  onStatusChange: (callback: (status: AppStatus) => void) => void;
  removeStatusListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

