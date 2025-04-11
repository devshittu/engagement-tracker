// src/features/Sessions/types/index.ts
export type DeclineReason = {
  id: number;
  name: string;
  createdAt: string; // ISO string
  updatedAt: string | null; // ISO string or null
};

export type DeclinedSession = {
  id: number;
  sessionId: number;
  declineReasonId: number;
  description: string | null;
  createdAt: string; // ISO string
  session: Session; // Nested session data
  declineReason: DeclineReason; // Nested reason data
};

// Extend existing Session type (assuming it exists elsewhere, e.g., from activities)
export type Session = {
  id: number;
  type: 'GROUP' | 'ONE_TO_ONE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'DECLINED';
  facilitatedById: string;
  facilitatedBy: {
    id: string;
    email: string;
    name: string | null;
  };
  activityLogId: number;
  activityLog: {
    id: number;
    activity: {
      id: number;
      name: string;
    };
  };
  admissionId: number;
  admission: {
    id: number;
    serviceUser: {
      id: number;
      name: string;
    };
    ward: {
      id: number;
      name: string;
    };
  };
  groupRef: string | null;
  groupDescription: string | null;
  timeIn: string; // ISO string
  timeOut: string | null; // ISO string or null
  cancelReason: string | null;
  createdAt: string; // ISO string
  updatedAt: string | null; // ISO string or null
  declinedSession?: DeclinedSession | null;
};
// src/features/Sessions/types/index.ts
