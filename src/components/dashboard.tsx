"use client";

import { useState } from "react";
import { UsageResponse } from "@/lib/types";
import { transformToChartData, transformToHourlyData, getAvailableDates } from "@/lib/utils";
import { StatsCard } from "./stats-card";
import { UsageChart } from "./usage-chart";
import { HourlyChart } from "./hourly-chart";
import { EndpointBreakdown } from "./endpoint-breakdown";
import { Activity, MessageSquare, User, Users, LogOut, RefreshCw } from "lucide-react";

interface DashboardProps {
  data: UsageResponse;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Dashboard({ data, onLogout, onRefresh, isRefreshing }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const chartData = transformToChartData(data);
  const availableDates = getAvailableDates(data);
  const hourlyData = selectedDate ? transformToHourlyData(data, selectedDate) : null;

  // Calculate endpoint totals
  const tweetTotal = data.endpoints["/tweet"]?.total || 0;
  const userTotal = data.endpoints["/user"]?.total || 0;
  const communityTotal = data.endpoints["/community"]?.total || 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-[hsl(var(--background)/0.8)] border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)]">
                <Activity className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  Twitter API Dashboard
                </h1>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Usage Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-[hsl(var(--muted-foreground))] ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                title="Change API key"
              >
                <LogOut className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total API Calls"
            value={data.total}
            icon={Activity}
            description="All endpoints"
          />
          <StatsCard
            title="Tweet Lookups"
            value={tweetTotal}
            icon={MessageSquare}
          />
          <StatsCard
            title="User Lookups"
            value={userTotal}
            icon={User}
          />
          <StatsCard
            title="Community Lookups"
            value={communityTotal}
            icon={Users}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {selectedDate && hourlyData ? (
              <HourlyChart
                data={hourlyData}
                selectedDate={selectedDate}
                onClose={() => setSelectedDate(null)}
              />
            ) : (
              <UsageChart
                data={chartData}
                onDateClick={(date) => setSelectedDate(date)}
              />
            )}
          </div>
          <div>
            <EndpointBreakdown data={data} />
          </div>
        </div>

        {/* Date Selector Pills */}
        {availableDates.length > 0 && (
          <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Quick Date Access
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableDates.slice(0, 14).map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedDate === date
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.2)]"
                  }`}
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Powered by{" "}
            <a
              href="https://bark.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              Bark
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
