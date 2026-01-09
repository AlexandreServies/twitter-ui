"use client";

import {useState} from "react";
import {Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {AllHoursDataPoint, ChartDataPoint} from "@/lib/types";
import {formatNumber} from "@/lib/utils";

interface UsageChartProps {
    dailyData: ChartDataPoint[];
    hourlyData: AllHoursDataPoint[];
  onDateClick?: (date: string) => void;
}

const COLORS: Record<string, string> = {
  tweet: "hsl(43, 92%, 55%)",      // Gold
  user: "hsl(168, 76%, 42%)",      // Teal
  community: "hsl(270, 70%, 60%)", // Purple
    follows: "hsl(340, 82%, 52%)",   // Pink/Red
};

const ENDPOINTS = ["tweet", "user", "community", "follows"] as const;
const ENDPOINT_LABELS: Record<string, string> = {
    tweet: "Tweet",
    user: "User",
    community: "Community",
    follows: "Follows",
};

// Custom dot renderer - shows hollow dot on last point to indicate incomplete data
const CustomDot = (props: {
    cx?: number;
    cy?: number;
    index?: number;
    dataLength: number;
    stroke?: string;
    payload?: ChartDataPoint | AllHoursDataPoint;
    dataKey?: string;
}) => {
    const {cx, cy, index, dataLength, stroke, payload, dataKey} = props;
    if (cx === undefined || cy === undefined || index === undefined) return null;

    // Only show dot on last point
    if (index !== dataLength - 1) return null;

    // Don't show dot if value is 0
    const value = payload?.[dataKey as keyof (ChartDataPoint | AllHoursDataPoint)];
    if (!value || value === 0) return null;

    return (
        <g>
            <circle cx={cx} cy={cy} r={6} fill="hsl(var(--background))" stroke={stroke} strokeWidth={2}/>
            <circle cx={cx} cy={cy} r={2} fill={stroke}/>
        </g>
    );
};

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function formatHourLabel(datetime: string): string {
    // datetime is "YYYY-MM-DD HH:00"
    const [date, time] = datetime.split(" ");
    const d = new Date(date);
    const hour = parseInt(time.split(":")[0]);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${d.toLocaleDateString("en-US", {month: "short", day: "numeric"})} ${hour12}${ampm}`;
}

export function UsageChart({dailyData, hourlyData, onDateClick}: UsageChartProps) {
    const [viewMode, setViewMode] = useState<"daily" | "hourly">("daily");

    const data = viewMode === "daily" ? dailyData : hourlyData;
    const dataKey = viewMode === "daily" ? "date" : "datetime";
    const formatLabel = viewMode === "daily" ? formatDateLabel : formatHourLabel;

  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    {viewMode === "daily" ? "Daily" : "Hourly"} Usage
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    API credits per {viewMode === "daily" ? "day" : "hour"} by endpoint
                </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[hsl(var(--muted))]">
                <button
                    onClick={() => setViewMode("daily")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === "daily"
                            ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    }`}
                >
                    Daily
                </button>
                <button
                    onClick={() => setViewMode("hourly")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === "hourly"
                            ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    }`}
                >
                    Hourly
                </button>
            </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={(e) => {
                if (viewMode !== "daily") return;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const payload = (e as any)?.activePayload?.[0]?.payload;
              if (payload?.date && onDateClick) {
                onDateClick(payload.date);
              }
            }}
          >
            <defs>
                {ENDPOINTS.map(endpoint => (
                    <linearGradient key={endpoint} id={`gradient${endpoint}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[endpoint]} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS[endpoint]} stopOpacity={0}/>
                    </linearGradient>
                ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
                dataKey={dataKey}
                tickFormatter={formatLabel}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
                interval={viewMode === "hourly" ? Math.floor(data.length / 8) : undefined}
            />
            <YAxis
              tickFormatter={(value) => formatNumber(value)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelFormatter={(value) => formatLabel(value as string)}
              formatter={(value, name) => [formatNumber(value as number), ENDPOINT_LABELS[name as string] || name]}
              cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />

              {ENDPOINTS.map(endpoint => (
                  <Area
                      key={endpoint}
                      type="monotone"
                      dataKey={endpoint}
                      name={ENDPOINT_LABELS[endpoint]}
                      stroke={COLORS[endpoint]}
                      strokeWidth={2}
                      fill={`url(#gradient${endpoint})`}
                      dot={(props) => (
                          <CustomDot
                              {...props}
                              dataLength={data.length}
                              dataKey={endpoint}
                          />
                      )}
                      activeDot={{r: 6, stroke: COLORS[endpoint], strokeWidth: 2, fill: "hsl(var(--background))"}}
                  />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border-2 border-current"/>
          Incomplete {viewMode === "daily" ? "day" : "hour"}
        </span>
            {viewMode === "daily" && onDateClick && (
                <>
                    <span className="mx-2">•</span>
                    <span>Click on a date to view hourly breakdown</span>
                </>
            )}
        </div>
    </div>
  );
}
