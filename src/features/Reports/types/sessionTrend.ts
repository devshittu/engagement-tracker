// src/features/Reports/types/sessionTrend.ts
export type Period = 'day' | 'week' | 'month' | 'year';

export type TrendReportResponse = {
  period: Period;
  groupBy: string;
  currentData: { label: string; count: number }[];
  previousData: { label: string; count: number }[];
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
  hasDecline: boolean;
};
