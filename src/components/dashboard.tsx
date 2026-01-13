"use client";

import {useMemo, useState} from "react";
import {MetricsResponse, UsageResponse} from "@/lib/types";
import {transformToAllHoursData, transformToChartData, transformToHourlyData} from "@/lib/utils";
import {StatsCard} from "./stats-card";
import {UsageChart} from "./usage-chart";
import {HourlyChart} from "./hourly-chart";
import {EndpointBreakdown} from "./endpoint-breakdown";
import {Activity, Coins, MessageSquare, User, UserCheck, Users, UsersRound,} from "lucide-react";

interface DashboardProps {
    data: UsageResponse;
    metrics: MetricsResponse | null;
}

export function Dashboard({data, metrics}: DashboardProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
                {/* Credits Card */}
                <div className="mb-6">
                    <StatsCard
                        title="Credits Remaining"
                        value={data.creditsRemaining}
                        icon={Coins}
                        unit="credits"
                    />
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
        </div>
    );
}
