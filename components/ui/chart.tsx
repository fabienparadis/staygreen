"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  config,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: value.color }}
            />
            <span className="text-sm text-muted-foreground">{value.label}</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export type { ChartConfig };

