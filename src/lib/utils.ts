import { UsageResponse, ChartDataPoint, HourlyDataPoint } from "./types";

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

export function transformToChartData(data: UsageResponse): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  // Collect all dates from all endpoints
  for (const [endpoint, endpointData] of Object.entries(data.endpoints)) {
    for (const [date, dayData] of Object.entries(endpointData.days)) {
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          tweet: 0,
          user: 0,
          community: 0,
          total: 0,
        });
      }
      const point = dateMap.get(date)!;
      const endpointKey = endpoint.replace("/", "") as "tweet" | "user" | "community";
      point[endpointKey] = dayData.total;
      point.total += dayData.total;
    }
  }

  // Sort by date ascending
  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function transformToHourlyData(data: UsageResponse, selectedDate: string): HourlyDataPoint[] {
  const hourMap = new Map<string, HourlyDataPoint>();

  // Initialize all 24 hours
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0");
    hourMap.set(hour, {
      hour: `${hour}:00`,
      tweet: 0,
      user: 0,
      community: 0,
      total: 0,
    });
  }

  // Fill in data from each endpoint
  for (const [endpoint, endpointData] of Object.entries(data.endpoints)) {
    const dayData = endpointData.days[selectedDate];
    if (dayData?.hours) {
      for (const [hour, count] of Object.entries(dayData.hours)) {
        const point = hourMap.get(hour);
        if (point) {
          const endpointKey = endpoint.replace("/", "") as "tweet" | "user" | "community";
          point[endpointKey] = count;
          point.total += count;
        }
      }
    }
  }

  return Array.from(hourMap.values());
}

export function getAvailableDates(data: UsageResponse): string[] {
  const dates = new Set<string>();
  for (const endpointData of Object.values(data.endpoints)) {
    for (const date of Object.keys(endpointData.days)) {
      dates.add(date);
    }
  }
  return Array.from(dates).sort((a, b) => b.localeCompare(a)); // Most recent first
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function filterDataByDateRange(
  data: UsageResponse,
  startDate: Date,
  endDate: Date
): UsageResponse {
  const startStr = formatDateString(startDate);
  const endStr = formatDateString(endDate);

  const filteredEndpoints: UsageResponse["endpoints"] = {};
  let filteredTotal = 0;

  for (const [endpoint, endpointData] of Object.entries(data.endpoints)) {
    const filteredDays: typeof endpointData.days = {};
    let endpointTotal = 0;

    for (const [date, dayData] of Object.entries(endpointData.days)) {
      if (date >= startStr && date <= endStr) {
        filteredDays[date] = dayData;
        endpointTotal += dayData.total;
      }
    }

    filteredEndpoints[endpoint] = {
      total: endpointTotal,
      days: filteredDays,
    };
    filteredTotal += endpointTotal;
  }

  return {
    total: filteredTotal,
    endpoints: filteredEndpoints,
  };
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
