"use client";

import {Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {ChartDataPoint} from "@/lib/types";
import {formatDate, formatNumber} from "@/lib/utils";

interface UsageChartProps {
  data: ChartDataPoint[];
  onDateClick?: (date: string) => void;
}

const COLORS = {
  tweet: "hsl(43, 92%, 55%)",      // Gold
  user: "hsl(168, 76%, 42%)",      // Teal
  community: "hsl(270, 70%, 60%)", // Purple
    follows: "hsl(340, 82%, 52%)",   // Pink/Red
};

export function UsageChart({ data, onDateClick }: UsageChartProps) {
  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Daily Usage
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
            API credits per day by endpoint
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const payload = (e as any)?.activePayload?.[0]?.payload;
              if (payload?.date && onDateClick) {
                onDateClick(payload.date);
              }
            }}
          >
            <defs>
              <linearGradient id="gradientTweet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.tweet} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.tweet} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientUser" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.user} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.user} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientCommunity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.community} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.community} stopOpacity={0} />
              </linearGradient>
                <linearGradient id="gradientFollows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.follows} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.follows} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDate(value)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
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
              labelFormatter={(value) => formatDate(value as string)}
              formatter={(value, name) => [formatNumber(value as number), name]}
              cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="tweet"
              name="Tweet"
              stroke={COLORS.tweet}
              strokeWidth={2}
              fill="url(#gradientTweet)"
              dot={false}
              activeDot={{ r: 6, stroke: COLORS.tweet, strokeWidth: 2, fill: "hsl(var(--background))" }}
            />
            <Area
              type="monotone"
              dataKey="user"
              name="User"
              stroke={COLORS.user}
              strokeWidth={2}
              fill="url(#gradientUser)"
              dot={false}
              activeDot={{ r: 6, stroke: COLORS.user, strokeWidth: 2, fill: "hsl(var(--background))" }}
            />
            <Area
              type="monotone"
              dataKey="community"
              name="Community"
              stroke={COLORS.community}
              strokeWidth={2}
              fill="url(#gradientCommunity)"
              dot={false}
              activeDot={{ r: 6, stroke: COLORS.community, strokeWidth: 2, fill: "hsl(var(--background))" }}
            />
              <Area
                  type="monotone"
                  dataKey="follows"
                  name="Follows"
                  stroke={COLORS.follows}
                  strokeWidth={2}
                  fill="url(#gradientFollows)"
                  dot={false}
                  activeDot={{r: 6, stroke: COLORS.follows, strokeWidth: 2, fill: "hsl(var(--background))"}}
              />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {onDateClick && (
        <p className="mt-4 text-xs text-center text-[hsl(var(--muted-foreground))]">
          Click on a date to view hourly breakdown
        </p>
      )}
    </div>
  );
}
