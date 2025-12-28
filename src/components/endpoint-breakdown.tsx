"use client";

import { UsageResponse } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { MessageSquare, User, Users } from "lucide-react";

interface EndpointBreakdownProps {
  data: UsageResponse;
}

const ENDPOINT_CONFIG = {
  "/tweet": {
    icon: MessageSquare,
    label: "Tweet",
    color: "hsl(43, 92%, 55%)",
  },
  "/user": {
    icon: User,
    label: "User",
    color: "hsl(43, 70%, 45%)",
  },
  "/community": {
    icon: Users,
    label: "Community",
    color: "hsl(38, 80%, 50%)",
  },
};

export function EndpointBreakdown({ data }: EndpointBreakdownProps) {
  const endpoints = Object.entries(data.endpoints).map(([endpoint, usage]) => {
    const config = ENDPOINT_CONFIG[endpoint as keyof typeof ENDPOINT_CONFIG];
    const percentage = data.total > 0 ? (usage.total / data.total) * 100 : 0;
    return {
      endpoint,
      ...config,
      total: usage.total,
      percentage,
    };
  });

  // Sort by total descending
  endpoints.sort((a, b) => b.total - a.total);

  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Endpoint Breakdown
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Usage distribution by endpoint
        </p>
      </div>
      <div className="space-y-4">
        {endpoints.map(({ endpoint, icon: Icon, label, color, total, percentage }) => (
          <div key={endpoint} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="font-medium text-[hsl(var(--foreground))]">
                  {label}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formatNumber(total)}
                </span>
                <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
