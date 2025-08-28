"use client";

import { Icons } from "@/components/icons";
import { StatusIndicator } from "@/components/StatusIndicator";
import { type AppStatus } from "@/lib/electron-api";
import { getElectronAPI } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<AppStatus>({
    isActive: false,
    startTime: null,
    lastToggle: null,
    sessionDuration: 0,
    nextToggleIn: 300,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Determine Electron presence after mount to avoid SSR/client mismatch
  const [hasElectron, setHasElectron] = useState(false);

  useEffect(() => {
    const api = getElectronAPI();
    if (!api) {
      setHasElectron(false);
      return;
    }
    setHasElectron(true);

    api.getStatus().then(setStatus);
    api.onStatusChange((newStatus: AppStatus) => {
      setStatus(newStatus);
    });

    return () => {
      api.removeStatusListener();
    };
  }, []);

  const handleToggle = async () => {
    const api = getElectronAPI();
    if (!api || isLoading) return;

    setIsLoading(true);
    try {
      if (status.isActive) {
        await api.stopStayGreen();
      } else {
        await api.startStayGreen();
      }
    } catch (error) {
      console.error("Failed to toggle Stay Green:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
    <div className="w-full max-w-sm">
      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-[#B3B3B3]/20 backdrop-blur-xl px-2 py-2">
          <div className="flex items-center justify-center">
            <h1 className="text-black/50 font-bold text-lg flex items-center">
              <Icons.stayGreenIcon className="size-4" />
              <span className="ml-2 text-xs font-normal">StayGreen</span>
            </h1>
            <div className="text-[#B9B9BC] text-xs opacity- ml-1">v1.0.0</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-10.5">
          <StatusIndicator
            status={status}
            onToggle={handleToggle}
            isLoading={isLoading}
          />
        </div>

        {/* Footer */}
        <div className="px-8 py-2 bg-gray-50/50 border-t border-gray-100">
          <div className="text-center text-xs text-[#B9B9BC]">
            Privacy-first • Local-only
          </div>
        </div>
      </div>

      {/* Development Notice */}
      {hasElectron === false && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-amber-800 text-center">
            Running in browser mode. Electron features will be available when
            running as a desktop app.
          </p>
        </div>
      )}
    </div>
    // </div>
  );
}
