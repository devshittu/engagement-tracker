export type ServiceUserStatus = 'admitted' | 'discharged' | 'all';

export type Ward = {
  id: number;
  name: string;
};

export type Admission = {
  id: number;
  serviceUserId: number;
  wardId: number;
  admissionDate: string;
  dischargeDate?: string | null;
  ward: Ward; // from your schema
  serviceUser: ServiceUser; // <--- Add this to match your schema
};

export type Activity = {
  id: number;
  name: string;
  // Additional fields if needed
  createdAt?: string;
  updatedAt?: string | null;
};
export type ActivityContinuityLog = {
  id: number;
  activity: Activity;
  startDate: string;
  discontinuedDate?: string | null;
  reason?: string | null;
  duration?: number | null;
};

export type Session = {
  id: number;
  admissionId: number;
  timeIn: string;
  timeOut?: string | null;
  type: 'GROUP' | 'ONE_TO_ONE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  groupRef?: string | null;
  groupDescription?: string | null;
  admission: Admission;
  activityLog: ActivityContinuityLog; // Updated to match schema
};

export type ServiceUsersResponse = {
  serviceUsers: ServiceUser[] | { [wardName: string]: ServiceUser[] };
  total: number;
  page: number;
  pageSize: number;
};

export type ServiceUser = {
  id: number;
  nhsNumber: string; // Unique NHS-like identification
  name: string;
  // status: ServiceUserStatus;
  createdAt: string;
  updatedAt?: string | null;
  admissions?: Admission[]; // A service user can have multiple admissions
};

// Normal approach: returns an array of Session objects
export type SessionsResponse = {
  sessions: Session[];
  total: number; // total number of sessions
  page: number; // current page
  pageSize: number; // size of each page
};

// GroupBy aggregator approach: returns array of aggregator objects
export type GroupedSession = {
  // Example shape from Prisma groupBy
  // e.g. if grouping by "timeIn" and counting
  timeIn?: string;
  admissionId?: number;
  activityId?: number;
  // aggregator fields
  _count: {
    _all: number;
  };
};

export type GroupedResponse = {
  groupedData: GroupedSession[];
  pageParam: number;
};

// src/types/serviceUser.ts
