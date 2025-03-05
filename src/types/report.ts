// types/report.ts
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ActivityReport = {
  activityName: string;
  count: number;
};
