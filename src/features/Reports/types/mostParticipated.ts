// src/features/Reports/types/mostParticipated.ts
export type MostParticipatedResponse = {
  period: { year: number; month: number };
  data: {
    activityId: number;
    count: number;
    activityName: string;
  }[];
  top: {
    activityId: number;
    count: number;
    activityName: string;
  } | null;
};
