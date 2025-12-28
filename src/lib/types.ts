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
  endpoints: Record<string, EndpointUsage>;
}

export interface ChartDataPoint {
  date: string;
  tweet: number;
  user: number;
  community: number;
  total: number;
}

export interface HourlyDataPoint {
  hour: string;
  tweet: number;
  user: number;
  community: number;
  total: number;
}
