// // src/features/Reports/types/serviceUserEngagement.ts
// export type ServiceUserEngagementResponse = {
//   serviceUserId: string;
//   period: 'day' | 'week' | 'month';
//   data: {
//     date: string; // e.g., "2025-03-01"
//     sessionCount: number;
//   }[];
//   totalSessions: number;
//   averageSessionsPerPeriod: number;
// };

// src/features/Reports/types/serviceUserEngagement.ts
export type ServiceUserEngagementResponse = {
  serviceUser: {
    id: string;
    name: string;
    nhsNumber: string;
  };
  wardDetails?: {
    name: string;
    admissionDate: string;
    dischargeDate: string | null;
  };
  activities: string[];
  period: 'day' | 'week' | 'month';
  data: { date: string; sessionCount: number }[];
  totalSessions: number;
  averageSessionsPerPeriod: number;
  admissionId?: string;
};
