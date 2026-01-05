import {ChartDataPoint, HourlyDataPoint, UsageResponse} from "./types";
import {DateRange} from "./api";

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function transformToChartData(data: UsageResponse, dateRange: DateRange): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

    // Find the last date with actual data
    let lastDateWithData = dateRange.from;
    for (const endpointData of Object.values(data.endpoints)) {
        for (const date of Object.keys(endpointData.days)) {
            if (date > lastDateWithData && date <= dateRange.to) {
                lastDateWithData = date;
            }
        }
    }

    // Initialize all days from start to last date with data
    const startDate = new Date(dateRange.from + "T00:00:00");
    const endDate = new Date(lastDateWithData + "T00:00:00");

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        dateMap.set(dateStr, {
            date: dateStr,
            tweet: 0,
            user: 0,
            community: 0,
            follows: 0,
            total: 0,
        });
    }

    // Fill in actual data from endpoints
  for (const [endpoint, endpointData] of Object.entries(data.endpoints)) {
    for (const [date, dayData] of Object.entries(endpointData.days)) {
        if (!dateMap.has(date)) continue;
      const point = dateMap.get(date)!;
        const endpointKey = endpoint.replace("/", "") as "tweet" | "user" | "community" | "follows";
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
        follows: 0,
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
            const endpointKey = endpoint.replace("/", "") as "tweet" | "user" | "community" | "follows";
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
    month: "short",
    day: "numeric",
  });
}

