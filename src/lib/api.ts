import { UsageResponse } from "./types";

const API_BASE_URL = "https://twitter.bark.gg";

// Mock data for development
function generateMockData(): UsageResponse {
  const today = new Date();
  const endpoints: UsageResponse["endpoints"] = {};

  ["/tweet", "/user", "/community"].forEach((endpoint) => {
    const days: Record<string, { total: number; hours: Record<string, number> }> = {};

    for (let d = 0; d < 14; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];

      const hours: Record<string, number> = {};
      let dayTotal = 0;

      // Generate data for all 24 hours
      for (let h = 0; h < 24; h++) {
        const hourStr = h.toString().padStart(2, "0");
        const count = Math.floor(Math.random() * 150) + 10;
        hours[hourStr] = count;
        dayTotal += count;
      }

      days[dateStr] = { total: dayTotal, hours };
    }

    const endpointTotal = Object.values(days).reduce((sum, d) => sum + d.total, 0);
    endpoints[endpoint] = { total: endpointTotal, days };
  });

  const total = Object.values(endpoints).reduce((sum, e) => sum + e.total, 0);
  return { total, endpoints };
}

export async function fetchUsage(apiKey: string): Promise<UsageResponse> {
  // Use mock data in development mode
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    return generateMockData();
  }

  const response = await fetch(`${API_BASE_URL}/usage`, {
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
