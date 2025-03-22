// src/features/Reports/types/dashboardMetrics.ts
export type DashboardMetricsResponse = {
  metrics: {
    title: string;
    value: number;
    change: number;
    positive: boolean;
  }[];
};
