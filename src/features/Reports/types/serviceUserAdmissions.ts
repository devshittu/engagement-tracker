// src/features/Reports/types/serviceUserAdmissions.ts
export type AdmissionStatus = 'admitted' | 'discharged' | 'all';

export type Admission = {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  status: 'admitted' | 'discharged';
  ward: string;
  admittedBy: string;
  dischargedBy?: string;
};

export type ServiceUserAdmissionsResponse = {
  serviceUserId: string;
  admissions: Admission[];
};

// src/features/Reports/types/serviceUserEngagement.ts
export type ServiceUserEngagementResponse = {
  serviceUserId: string;
  period: 'day' | 'week' | 'month';
  data: {
    date: string;
    sessionCount: number;
  }[];
  totalSessions: number;
  averageSessionsPerPeriod: number;
  admissionId?: string;
};
