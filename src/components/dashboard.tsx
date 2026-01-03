"use client";

import {useMemo, useState} from "react";
import {MetricsResponse, UsageResponse} from "@/lib/types";
import {DateRange, sendEmergencyAlert} from "@/lib/api";
import {getAvailableDates, transformToChartData, transformToHourlyData} from "@/lib/utils";
import {StatsCard} from "./stats-card";
import {UsageChart} from "./usage-chart";
import {HourlyChart} from "./hourly-chart";
import {EndpointBreakdown} from "./endpoint-breakdown";
import {DateRangePicker} from "./date-range-picker";
import {Activity, AlertTriangle, BookOpen, Coins, LogOut, MessageSquare, RefreshCw, User, Users} from "lucide-react";

interface DashboardProps {
  data: UsageResponse;
    metrics: MetricsResponse | null;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
    apiKey: string;
}

export function Dashboard({
                              data,
                              metrics,
                              dateRange,
                              onDateRangeChange,
                              onLogout,
                              onRefresh,
                              isRefreshing,
                              apiKey
                          }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
    const [emergencySending, setEmergencySending] = useState(false);

    const handleEmergencyAlert = async () => {
        setEmergencySending(true);
        try {
            await sendEmergencyAlert(apiKey);
            setShowEmergencyConfirm(false);
        } catch (error) {
            console.error("Failed to send emergency alert:", error);
        } finally {
            setEmergencySending(false);
        }
    };

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
                <button
                    onClick={() => setShowEmergencyConfirm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    title="Emergency Alert"
                >
                    <AlertTriangle className="w-4 h-4 text-white"/>
                    <span className="text-sm font-medium text-white">Emergency</span>
                </button>
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
        {/* Credits Card */}
        <div className="mb-6">
          <StatsCard
            title="Credits Remaining"
            value={data.creditsRemaining}
            icon={Coins}
            unit="credits"
          />
        </div>

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
              title="All Endpoints"
            value={data.total}
            icon={Activity}
          />
          <StatsCard
              title="Tweets"
            value={tweetTotal}
            icon={MessageSquare}
              medianMs={metrics?.["/tweet/{id}"]?.p50Ms}
          />
          <StatsCard
              title="Users"
            value={userTotal}
            icon={User}
              medianMs={metrics?.["/user/{idOrHandle}"]?.p50Ms}
          />
          <StatsCard
              title="Communities"
            value={communityTotal}
            icon={Users}
              medianMs={metrics?.["/community/{id}"]?.p50Ms}
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

        {/* Emergency Confirmation Modal */}
        {showEmergencyConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div
                    className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg p-6 max-w-md mx-4 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-red-100">
                            <AlertTriangle className="w-6 h-6 text-red-600"/>
                        </div>
                        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                            Emergency Alert
                        </h3>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Are you sure you want to send an emergency alert? This will send a high-priority notification
                        immediately.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowEmergencyConfirm(false)}
                            disabled={emergencySending}
                            className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEmergencyAlert}
                            disabled={emergencySending}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            {emergencySending ? "Sending..." : "Send Alert"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
