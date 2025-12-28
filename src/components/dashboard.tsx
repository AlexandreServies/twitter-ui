"use client";

import {useMemo, useState} from "react";
import {UsageResponse} from "@/lib/types";
import {DateRange} from "@/lib/api";
import {getAvailableDates, transformToChartData, transformToHourlyData} from "@/lib/utils";
import {StatsCard} from "./stats-card";
import {UsageChart} from "./usage-chart";
import {HourlyChart} from "./hourly-chart";
import {EndpointBreakdown} from "./endpoint-breakdown";
import {DateRangePicker} from "./date-range-picker";
import {Activity, BookOpen, LogOut, MessageSquare, RefreshCw, User, Users} from "lucide-react";

interface DashboardProps {
  data: UsageResponse;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Dashboard({data, dateRange, onDateRangeChange, onLogout, onRefresh, isRefreshing}: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const availableDates = useMemo(() => getAvailableDates(data), [data]);

    // Convert DateRange (string) to Date objects for the picker
    const pickerDateRange = useMemo(() => ({
        start: new Date(dateRange.from + "T00:00:00"),
        end: new Date(dateRange.to + "T23:59:59"),
    }), [dateRange]);

    const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
        if (range.start && range.end) {
            const formatDate = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };
            onDateRangeChange({
                from: formatDate(range.start),
                to: formatDate(range.end),
            });
    }
    };

    const chartData = useMemo(() => transformToChartData(data, dateRange), [data, dateRange]);
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
            <div className="flex items-center gap-3">
                <a
                    href="https://twitter.bark.gg/swagger-ui/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                    title="API Docs"
                >
                    <BookOpen className="w-5 h-5 text-[hsl(var(--muted-foreground))]"/>
                </a>
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
        {/* Date Range Picker */}
        <div className="mb-6">
          <DateRangePicker
              startDate={pickerDateRange.start}
              endDate={pickerDateRange.end}
              onChange={handleDateRangeChange}
            availableDates={availableDates}
          />
        </div>

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
              <EndpointBreakdown data={data}/>
          </div>
        </div>

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
