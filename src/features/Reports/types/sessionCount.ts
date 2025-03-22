// src/features/Reports/types/sessionCount.ts
export type Period = 'day' | 'week' | 'month' | 'year';

export type SessionCountResponse =
  | {
      period: Period;
      groupBy?: string;
      current: { _count: { id: number } };
      previous: { _count: { id: number } };
      trend: {
        countDifference: number;
        percentageChange: number;
      };
    }
  | {
      period: Period;
      groupBy: string;
      current: { [key: string]: any; _count: { id: number } }[];
      previous: { [key: string]: any; _count: { id: number } }[];
    };
