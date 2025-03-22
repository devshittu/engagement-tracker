// src/features/activities/types/index.ts

export type Activity = {
  id: number;
  name: string;
  description: string | null;
  departmentId: number | null;
  department: Department | null;
  createdAt: string;
  updatedAt: string | null;
  continuityLogs?: ActivityContinuityLog[];
};

export type Department = {
  id: number;
  name: string;
};

export type ActivityContinuityLog = {
  id: number;
  activityId: number;
  activity: Activity;
  createdById: string;
  startDate: string;
  discontinuedDate: string | null;
  reason: string | null;
  duration: number | null;
};

export type CreateActivityInput = {
  name: string;
  description?: string;
  departmentId?: number;
};

export type UpdateActivityInput = {
  name?: string;
  description?: string | null;
  departmentId?: number | null;
};

export type BatchActivateInput = {
  activityId: number;
  activate: boolean;
};
