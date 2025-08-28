"use client";

import { type AppStatus } from "@/lib/electron-api";
import { cn, formatTime } from "@/lib/utils";
import { Icons } from "./icons";
import { Button } from "./ui/button";

interface StatusIndicatorProps {
  status: AppStatus;
  onToggle: () => void;
  isLoading?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  onToggle,
  isLoading = false,
  className,
}: StatusIndicatorProps) {
  const { isActive, sessionDuration, nextToggleIn } = status;

  // Progress percent (0-100)
  const progress = isActive
    ? Math.min(((sessionDuration % 300) / 300) * 100, 100)
    : 0;
  const size = 200;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {/* Radial Timer (single ring) */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isActive ? "#34C759" : "#E1E1E2"}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-medium tracking-tight flex flex-col items-center">
            {isActive ? formatTime(sessionDuration) : "00:00"}
            <span className="text-sm font-normal">
              {isActive ? (
                <span className="text-[#34C759]">Active</span>
              ) : (
                <span className="text-[#B9B9BC]">Stopped</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {/* <h2
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            !isActive ? "text-[#A1F293]" : "text-[#B9B9BC]"
          )}
        >
          {isActive ? "StayGreen Active" : "Click to Start"}
        </h2> */}
        {/* {isActive && (
          <p className="text-sm text-[#B9B9BC] mt-1">
            Next toggle in {formatTime(nextToggleIn)}
          </p>
        )} */}
      </div>

      {/* Control Button */}
      <Button
        onClick={onToggle}
        disabled={isLoading}
        size="sm"
        className={cn(
          "rounded-sm w-20 h-8 transition-all duration-300",
          isActive
            ? "bg-[#EEEEEF] hover:bg-[#B9B9BC]/30 text-[#B9B9BC]"
            : "bg-[#007AFF] hover:bg-[#007AFF]/80 text-white"
        )}
      >
        {isLoading ? (
          <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin cursor-pointer" />
        ) : isActive ? (
          <div className="flex items-center justify-center">
            <Icons.pause className="size-4 mr-1" />
            <span className="text-xs font-normal">Stop</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Icons.play className="size-4 mr-1" />
            <span className="text-xs font-normal">Start</span>
          </div>
        )}
      </Button>
    </div>
  );
}
