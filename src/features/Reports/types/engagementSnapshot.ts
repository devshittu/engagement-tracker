export type EngagementSnapshotWard = {
  wardId: number;
  wardName: string;
  serviceUsers: number;
  groups: {
    offered: number;
    attended: number;
    declined: number;
    percentAttended: number;
    percentDeclined: number;
  };
  oneToOnes: {
    offered: number;
    attended: number;
    declined: number;
    percentAttended: number;
    percentDeclined: number;
  };
};

export type EngagementSnapshotResponse = {
  period: string;
  startDate: string;
  endDate: string;
  snapshot: EngagementSnapshotWard[];
  totals: {
    serviceUsers: number;
    groups: {
      offered: number;
      attended: number;
      declined: number;
      percentAttended: number;
      percentDeclined: number;
    };
    oneToOnes: {
      offered: number;
      attended: number;
      declined: number;
      percentAttended: number;
      percentDeclined: number;
    };
  };
};
