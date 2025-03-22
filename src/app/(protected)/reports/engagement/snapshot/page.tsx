// src/app/reports/engagement/snapshot/page.tsx
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { EngagementSnapshotReport } from '@/features/Reports/components/EngagementSnapshotReport';
import { prisma } from '@/lib/prisma';

export default async function EngagementSnapshotPage() {
  const earliestSession = await prisma.session.findFirst({
    orderBy: { timeIn: 'asc' },
    select: { timeIn: true },
  });

  const earliestDate =
    earliestSession?.timeIn?.toISOString().slice(0, 7) || '2020-01';

  return (
    <>
      <DashboardPageFrame title="Engagement Data Snapshot" pageActions={<></>}>
        <EngagementSnapshotReport earliestDate={earliestDate} />
      </DashboardPageFrame>
    </>
  );
}
