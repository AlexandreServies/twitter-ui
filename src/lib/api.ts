import {MetricsResponse, UsageResponse} from "./types";

const API_BASE_URL = "https://twitter.bark.gg";

export interface DateRange {
    from: string;  // yyyy-MM-dd
    to: string;    // yyyy-MM-dd
}

export function getDefaultDateRange(): DateRange {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    return {
        from: formatDateParam(thirtyDaysAgo),
        to: formatDateParam(today),
    };
}

function formatDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export async function fetchUsage(apiKey: string, dateRange?: DateRange): Promise<UsageResponse> {
    const range = dateRange || getDefaultDateRange();
    const params = new URLSearchParams({
        from: range.from,
        to: range.to,
    });

    const response = await fetch(`${API_BASE_URL}/usage?${params}`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API key");
    }
    if (response.status === 403) {
      throw new Error("Access denied");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchMetrics(apiKey: string): Promise<MetricsResponse> {
    const response = await fetch(`${API_BASE_URL}/metrics`, {
        headers: {
            "x-api-key": apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

export async function sendEmergencyAlert(apiKey: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/emergency-alert`, {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to send emergency alert: ${response.status}`);
    }
}
