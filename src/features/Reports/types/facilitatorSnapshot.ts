export type FacilitatorSnapshotUser = {
  userId: string;
  email: string;
  name: string;
  primaryWard: string;
  groups: {
    offered: number;
    completed: number;
    declined: number;
    percentCompleted: number;
    percentDeclined: number;
  };
  oneToOnes: {
    offered: number;
    completed: number;
    declined: number;
    percentCompleted: number;
    percentDeclined: number;
  };
};

export type FacilitatorSnapshotResponse = {
  period: string;
  startDate: string;
  endDate: string;
  snapshot: FacilitatorSnapshotUser[];
  totals: {
    groups: {
      offered: number;
      completed: number;
      declined: number;
      percentCompleted: number;
      percentDeclined: number;
    };
    oneToOnes: {
      offered: number;
      completed: number;
      declined: number;
      percentCompleted: number;
      percentDeclined: number;
    };
  };
};
