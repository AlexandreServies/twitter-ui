"use client";

import { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)]">
          <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
        <p className="text-3xl font-bold text-[hsl(var(--foreground))]">
          {formatNumber(value)}
        </p>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
    </div>
  );
}
