import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { FacilitatorEngagementReport } from '@/features/Reports/components/FacilitatorEngagementReport';
import { prisma } from '@/lib/prisma';

export default async function FacilitatorEngagementPage() {
  const earliestSession = await prisma.session.findFirst({
    orderBy: { timeIn: 'asc' },
    select: { timeIn: true },
  });

  const earliestDate =
    earliestSession?.timeIn?.toISOString().slice(0, 7) || '2020-01';

  return (
    <>
      <DashboardPageFrame
        title="Facilitator Engagement Snapshot"
        pageActions={<></>}
      >
        <FacilitatorEngagementReport earliestDate={earliestDate} />
      </DashboardPageFrame>
    </>
  );
}
