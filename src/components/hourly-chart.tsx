"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HourlyDataPoint } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { X } from "lucide-react";

interface HourlyChartProps {
  data: HourlyDataPoint[];
  selectedDate: string;
  onClose: () => void;
}

const COLORS = {
  tweet: "hsl(43, 92%, 55%)",      // Gold
  user: "hsl(168, 76%, 42%)",      // Teal
  community: "hsl(270, 70%, 60%)", // Purple
};

export function HourlyChart({ data, selectedDate, onClose }: HourlyChartProps) {
  const totalForDay = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Hourly Breakdown
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {formatDate(selectedDate)} &bull; {formatNumber(totalForDay)} total calls
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </button>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={1}
              tick={{ fontSize: 10 }}
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
              formatter={(value, name) => [formatNumber(value as number), name]}
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar
              dataKey="tweet"
              name="Tweet"
              fill={COLORS.tweet}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="user"
              name="User"
              fill={COLORS.user}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="community"
              name="Community"
              fill={COLORS.community}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
