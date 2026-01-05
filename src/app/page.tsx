"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {ApiKeyInput} from "@/components/api-key-input";
import {Dashboard} from "@/components/dashboard";
import {MetricsResponse, UsageResponse} from "@/lib/types";
import {DateRange, fetchMetrics, fetchUsage, getDefaultDateRange} from "@/lib/api";
import {getDateRangeFromData} from "@/lib/utils";

const API_KEY_STORAGE_KEY = "twitter-api-key";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [data, setData] = useState<UsageResponse | null>(null);
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);
    const currentDateRangeRef = useRef<DateRange>(dateRange);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
        handleConnect(savedKey, undefined, true);
    }
    setIsInitialized(true);
  }, []);

    const handleConnect = useCallback(async (key: string, range?: DateRange, isInitialLoad = false) => {
    setIsLoading(true);
    setError(null);

        const effectiveRange = range || currentDateRangeRef.current;

    try {
        const [usageData, metricsData] = await Promise.all([
            fetchUsage(key, effectiveRange),
            fetchMetrics(key),
        ]);

        // On initial load, calculate the proper date range from data
        if (isInitialLoad) {
            const dataRange = getDateRangeFromData(usageData);
            if (dataRange) {
                setDateRange(dataRange);
                currentDateRangeRef.current = dataRange;
            }
        }

      setData(usageData);
        setMetrics(metricsData);
      setApiKey(key);
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setData(null);
        setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

    const handleDateRangeChange = useCallback(async (range: DateRange) => {
        setDateRange(range);
        currentDateRangeRef.current = range;
        if (apiKey) {
            await handleConnect(apiKey, range);
        }
    }, [apiKey, handleConnect]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey("");
    setData(null);
      setMetrics(null);
    setError(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (apiKey) {
      await handleConnect(apiKey);
    }
  }, [apiKey, handleConnect]);

  // Show nothing until initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show dashboard if we have data
  if (data) {
    return (
      <Dashboard
        data={data}
        metrics={metrics}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        apiKey={apiKey}
      />
    );
  }

  // Show API key input
  return (
    <ApiKeyInput
      apiKey={apiKey}
      onSubmit={(key) => handleConnect(key, undefined, true)}
      isLoading={isLoading}
      error={error}
    />
  );
}
