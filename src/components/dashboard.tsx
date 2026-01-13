"use client";

import {useMemo, useState} from "react";
import {MetricsResponse, UsageResponse} from "@/lib/types";
import {sendEmergencyAlert} from "@/lib/api";
import {transformToAllHoursData, transformToChartData, transformToHourlyData} from "@/lib/utils";
import {StatsCard} from "./stats-card";
import {UsageChart} from "./usage-chart";
import {HourlyChart} from "./hourly-chart";
import {EndpointBreakdown} from "./endpoint-breakdown";
import {Activity, AlertTriangle, Coins, MessageSquare, User, UserCheck, Users, UsersRound,} from "lucide-react";

interface DashboardProps {
    data: UsageResponse;
    metrics: MetricsResponse | null;
    apiKey: string;
}

export function Dashboard({data, metrics, apiKey}: DashboardProps) {
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

    // Use full date range from data
    const dateRange = useMemo(() => {
        const allDates = Object.values(data.endpoints)
            .flatMap((ep) => Object.keys(ep.days))
            .filter((d, i, arr) => arr.indexOf(d) === i)
            .sort();

        if (allDates.length === 0) {
            const today = new Date();
            const formatted = today.toISOString().split("T")[0];
            return {from: formatted, to: formatted};
        }

        return {
            from: allDates[0],
            to: allDates[allDates.length - 1],
        };
    }, [data]);

    const chartData = useMemo(() => transformToChartData(data, dateRange), [data, dateRange]);
    const allHoursData = useMemo(() => transformToAllHoursData(data, dateRange), [data, dateRange]);
    const hourlyData = selectedDate ? transformToHourlyData(data, selectedDate) : null;

    // Calculate endpoint totals
    const tweetTotal = data.endpoints["/tweet"]?.total || 0;
    const userTotal = data.endpoints["/user"]?.total || 0;
    const communityTotal = data.endpoints["/community"]?.total || 0;
    const followsTotal = data.endpoints["/follows"]?.total || 0;
    const communitiesTotal = data.endpoints["/communities"]?.total || 0;

    return (
        <div className="bg-[hsl(var(--background))]">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top row: Credits + Emergency */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <StatsCard
                            title="Credits Remaining"
                            value={data.creditsRemaining}
                            icon={Coins}
                            unit="credits"
                        />
                    </div>
                    <button
                        onClick={() => setShowEmergencyConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                        title="Emergency Alert"
                    >
                        <AlertTriangle className="w-4 h-4 text-white"/>
                        <span className="text-sm font-medium text-white">Emergency</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
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
                        title="Community (single)"
                        value={communityTotal}
                        icon={Users}
                        medianMs={metrics?.["/community/{id}"]?.p50Ms}
                    />
                    <StatsCard
                        title="Follows (batch)"
                        value={followsTotal}
                        icon={UserCheck}
                        medianMs={metrics?.["/follows"]?.p50Ms}
                    />
                    <StatsCard
                        title="Communities (batch)"
                        value={communitiesTotal}
                        icon={UsersRound}
                        medianMs={metrics?.["/communities"]?.p50Ms}
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
                                dailyData={chartData}
                                hourlyData={allHoursData}
                                onDateClick={(date) => setSelectedDate(date)}
                            />
                        )}
                    </div>
                    <div>
                        <EndpointBreakdown data={data}/>
                    </div>
                </div>
            </main>

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
                            Are you sure you want to send an emergency alert? This will send a high-priority
                            notification
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
