// src/features/Sessions/types/backdatedSession.ts
import { SessionStatus, SessionType } from '@prisma/client';

export interface BackdatedSessionCreateInput {
  type: SessionType;
  admissionIds: number[];
  activityLogId?: number;
  timeIn: string;
  timeOut?: string;
  groupRef?: string;
}

export interface BackdatedSessionResponse
  extends Omit<
    BackdatedSessionCreateInput,
    'admissionIds' | 'timeIn' | 'timeOut'
  > {
  id: number;
  admissionId?: number;
  timeIn: Date;
  timeOut?: Date;
  status: SessionStatus;
}
// src/features/Sessions/types/backdatedSession.ts
