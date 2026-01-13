"use client";

import {useCallback, useEffect, useState} from "react";
import {Activity, BookOpen, RefreshCw} from "lucide-react";
import {ApiKeyEntry, TabData} from "@/lib/types";
import {DateRange, fetchMetrics, fetchUsage, getDefaultDateRange} from "@/lib/api";
import {generateId, getStoredApiKeys, saveApiKeys} from "@/lib/storage";
import {EmptyState} from "@/components/empty-state";
import {ApiKeyTabs} from "@/components/api-key-tabs";
import {Dashboard} from "@/components/dashboard";
import {DateRangePicker} from "@/components/date-range-picker";
import {getAvailableDates} from "@/lib/utils";

export default function Home() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>("");
    const [tabsData, setTabsData] = useState<Map<string, TabData>>(new Map());
    const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);

    // For tracking add key state
    const [isAddingKey, setIsAddingKey] = useState(false);
    const [addKeyError, setAddKeyError] = useState<string | null>(null);

    // Fetch data for a single API key
    const fetchDataForKey = useCallback(async (entry: ApiKeyEntry, range: DateRange) => {
        // Set loading state
        setTabsData((prev) => {
            const newMap = new Map(prev);
            newMap.set(entry.id, {
                data: prev.get(entry.id)?.data || null,
                metrics: prev.get(entry.id)?.metrics || null,
                isLoading: true,
                error: null,
            });
            return newMap;
        });

        try {
            const [usageData, metricsData] = await Promise.all([
                fetchUsage(entry.key, range),
                fetchMetrics(entry.key),
            ]);

            setTabsData((prev) => {
                const newMap = new Map(prev);
                newMap.set(entry.id, {
                    data: usageData,
                    metrics: metricsData,
                    isLoading: false,
                    error: null,
                });
                return newMap;
            });

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
            setTabsData((prev) => {
                const newMap = new Map(prev);
                newMap.set(entry.id, {
                    data: null,
                    metrics: null,
                    isLoading: false,
                    error: errorMessage,
                });
                return newMap;
            });
            return false;
        }
    }, []);

    // Load stored keys and fetch data on mount
    useEffect(() => {
        const storedKeys = getStoredApiKeys();
        setApiKeys(storedKeys);

        if (storedKeys.length > 0) {
            setActiveTabId(storedKeys[0].id);
            // Fetch data for all keys in parallel
            storedKeys.forEach((entry) => fetchDataForKey(entry, dateRange));
        }

        setIsInitialized(true);
    }, []);

    // Refetch all data when date range changes
    useEffect(() => {
        if (isInitialized && apiKeys.length > 0) {
            apiKeys.forEach((entry) => fetchDataForKey(entry, dateRange));
        }
    }, [dateRange]);

    // Add a new API key
    const handleAddKey = useCallback(async (key: string) => {
        setIsAddingKey(true);
        setAddKeyError(null);

        const newEntry: ApiKeyEntry = {
            id: generateId(),
            key,
        };

        // Try to fetch data to validate the key
        try {
            const [usageData, metricsData] = await Promise.all([
                fetchUsage(key, dateRange),
                fetchMetrics(key),
            ]);

            // Key is valid, add it
            const newKeys = [...apiKeys, newEntry];
            setApiKeys(newKeys);
            saveApiKeys(newKeys);
            setActiveTabId(newEntry.id);

            setTabsData((prev) => {
                const newMap = new Map(prev);
                newMap.set(newEntry.id, {
                    data: usageData,
                    metrics: metricsData,
                    isLoading: false,
                    error: null,
                });
                return newMap;
            });

            setAddKeyError(null);
        } catch (err) {
            setAddKeyError(err instanceof Error ? err.message : "Invalid API key");
        } finally {
            setIsAddingKey(false);
        }
    }, [apiKeys, dateRange]);

    // Remove an API key
    const handleRemoveKey = useCallback((id: string) => {
        const newKeys = apiKeys.filter((k) => k.id !== id);
        setApiKeys(newKeys);
        saveApiKeys(newKeys);

        // Update tabsData
        setTabsData((prev) => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });

        // Update active tab if needed
        if (activeTabId === id) {
            setActiveTabId(newKeys.length > 0 ? newKeys[0].id : "");
        }
    }, [apiKeys, activeTabId]);

    // Rename an API key
    const handleRenameKey = useCallback((id: string, label: string) => {
        const newKeys = apiKeys.map((k) =>
            k.id === id ? {...k, label} : k
        );
        setApiKeys(newKeys);
        saveApiKeys(newKeys);
    }, [apiKeys]);

    // Refresh current tab's data
    const handleRefresh = useCallback(() => {
        const activeEntry = apiKeys.find((k) => k.id === activeTabId);
        if (activeEntry) {
            fetchDataForKey(activeEntry, dateRange);
        }
    }, [apiKeys, activeTabId, dateRange, fetchDataForKey]);

    // Handle date range change
    const handleDateRangeChange = useCallback((range: { start: Date | null; end: Date | null }) => {
        if (range.start && range.end) {
            const formatDate = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };
            setDateRange({
                from: formatDate(range.start),
                to: formatDate(range.end),
            });
        }
    }, []);

    // Get current tab's data
    const activeTabData = tabsData.get(activeTabId);
    const activeEntry = apiKeys.find((k) => k.id === activeTabId);

    // Convert DateRange to Date objects for picker
    const pickerDateRange = {
        start: new Date(dateRange.from + "T00:00:00"),
        end: new Date(dateRange.to + "T23:59:59"),
    };

    // Get available dates from active tab's data
    const availableDates = activeTabData?.data ? getAvailableDates(activeTabData.data) : [];

    // Show nothing until initialized
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div
                    className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Header */}
            <header
                className="sticky top-0 z-10 backdrop-blur-lg bg-[hsl(var(--background)/0.8)] border-b border-[hsl(var(--border))]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)]">
                                <Activity className="w-6 h-6 text-[hsl(var(--primary))]"/>
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
                            {apiKeys.length > 0 && (
                                <>
                                    <DateRangePicker
                                        startDate={pickerDateRange.start}
                                        endDate={pickerDateRange.end}
                                        onChange={handleDateRangeChange}
                                        availableDates={availableDates}
                                    />
                                    <button
                                        onClick={handleRefresh}
                                        disabled={activeTabData?.isLoading}
                                        className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
                                        title="Refresh data"
                                    >
                                        <RefreshCw
                                            className={`w-5 h-5 text-[hsl(var(--muted-foreground))] ${activeTabData?.isLoading ? "animate-spin" : ""}`}/>
                                    </button>
                                </>
                            )}
                            <a
                                href="https://twitter.bark.gg/swagger-ui/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                                title="API Docs"
                            >
                                <BookOpen className="w-5 h-5 text-[hsl(var(--muted-foreground))]"/>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            {apiKeys.length === 0 ? (
                <EmptyState
                    onAddKey={handleAddKey}
                    isLoading={isAddingKey}
                    error={addKeyError}
                />
            ) : (
                <>
                    {/* Tabs */}
                    <div className="max-w-7xl mx-auto pt-4">
                        <ApiKeyTabs
                            apiKeys={apiKeys}
                            activeTabId={activeTabId}
                            onSelectTab={setActiveTabId}
                            onAddKey={handleAddKey}
                            onRemoveKey={handleRemoveKey}
                            onRenameKey={handleRenameKey}
                            isAddingKey={isAddingKey}
                            addKeyError={addKeyError}
                        />
                    </div>

                    {/* Dashboard */}
                    <div className="border-t border-[hsl(var(--border))]">
                        {activeTabData?.isLoading && !activeTabData.data ? (
                            <div className="min-h-[60vh] flex items-center justify-center">
                                <div
                                    className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"/>
                            </div>
                        ) : activeTabData?.error && !activeTabData.data ? (
                            <div className="min-h-[60vh] flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-[hsl(var(--destructive))] mb-4">{activeTabData.error}</p>
                                    <button
                                        onClick={handleRefresh}
                                        className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-all"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : activeTabData?.data && activeEntry ? (
                            <Dashboard
                                data={activeTabData.data}
                                metrics={activeTabData.metrics}
                                apiKey={activeEntry.key}
                            />
                        ) : null}
                    </div>
                </>
            )}

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
