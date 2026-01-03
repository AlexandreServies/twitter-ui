"use client";

import {LucideIcon} from "lucide-react";
import {formatNumber} from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
    medianMs?: number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({title, value, icon: Icon, description, medianMs, unit = "calls", trend}: StatsCardProps) {
  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-colors">
        <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)]">
          <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
        </div>
            <p className="text-base font-medium text-[hsl(var(--foreground))]">{title}</p>
        {trend && (
          <span
              className={`text-sm font-medium ml-auto ${
              trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </span>
        )}
      </div>
      <div className="space-y-1">
          <p className="text-2xl text-[hsl(var(--foreground))]">
              <span className="font-bold">{formatNumber(value)}</span>
              <span className="text-base text-[hsl(var(--muted-foreground))]"> {unit}</span>
        </p>
          {medianMs !== undefined && (
              <p className="text-xl text-[hsl(var(--foreground))]">
                  <span className="font-bold">{Math.round(medianMs)}ms</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]"> latency</span>
              </p>
        )}
      </div>
    </div>
  );
}
