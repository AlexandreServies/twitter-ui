"use client";

import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {UsageResponse} from "@/lib/types";
import {formatNumber} from "@/lib/utils";

interface EndpointBreakdownProps {
  data: UsageResponse;
}

const ENDPOINT_CONFIG: Record<string, { label: string; color: string }> = {
  "/tweet": {
    label: "Tweet",
    color: "hsl(43, 92%, 55%)",      // Gold
  },
  "/user": {
    label: "User",
    color: "hsl(168, 76%, 42%)",     // Teal
  },
  "/community": {
    label: "Community",
    color: "hsl(270, 70%, 60%)",     // Purple
  },
    "/follows": {
        label: "Follows",
        color: "hsl(340, 82%, 52%)",     // Pink/Red
    },
    "/communities": {
        label: "Communities",
        color: "hsl(190, 95%, 45%)",     // Cyan
    },
};

export function EndpointBreakdown({ data }: EndpointBreakdownProps) {
  const chartData = Object.entries(data.endpoints).map(([endpoint, usage]) => {
    const config = ENDPOINT_CONFIG[endpoint];
    const percentage = data.total > 0 ? (usage.total / data.total) * 100 : 0;
    return {
      name: config?.label || endpoint,
      value: usage.total,
      color: config?.color || "hsl(var(--muted))",
      percentage,
    };
  }).sort((a, b) => b.value - a.value);

  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Endpoint Breakdown
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Usage distribution by endpoint
        </p>
      </div>

      {/* Pie Chart */}
      <div className="h-[200px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{data.name}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatNumber(data.value)} ({data.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {item.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {formatNumber(item.value)}
              </span>
              <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
