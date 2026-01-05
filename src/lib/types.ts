export interface DayUsage {
  total: number;
  hours: Record<string, number>;
}

export interface EndpointUsage {
  total: number;
  days: Record<string, DayUsage>;
}

export interface UsageResponse {
  total: number;
  creditsRemaining: number;
  endpoints: Record<string, EndpointUsage>;
}

export interface ChartDataPoint {
  date: string;
  tweet: number;
  user: number;
  community: number;
    follows: number;
  total: number;
}

export interface HourlyDataPoint {
  hour: string;
  tweet: number;
  user: number;
  community: number;
    follows: number;
  total: number;
}

export interface EndpointMetrics {
    count: number;
    meanMs: number;
    maxMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
}

export interface MetricsResponse {
    [endpoint: string]: EndpointMetrics;
}
