// src/app/reports/page.tsx
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { DashboardMetricsReport } from '@/features/Reports/components/DashboardMetricsReport';
import { MostParticipatedReport } from '@/features/Reports/components/MostParticipatedReport';
import { SessionCountReport } from '@/features/Reports/components/SessionCountReport';
import { SessionTrendReport } from '@/features/Reports/components/SessionTrendReport';
import Reports from '@/features/Reports/Reports';
import Link from 'next/link';

export default function ReportsPage() {
  return (
    <DashboardPageFrame
      title="Activity Reports"
      pageActions={
        <>
          {/* <Link href={`#`} className="btn btn-primary">
          Export
        </Link> */}
          <Link href={`/reports/service-users`} className="btn btn-primary">
            Service Users Engagements
          </Link>
          <Link
            href={`/reports/engagement/snapshot/`}
            className="btn btn-primary"
          >
            Engagement Data Snapshot
          </Link>
          <Link
            href={`/reports/facilitator/snapshot/`}
            className="btn btn-primary"
          >
            Facilitator Engagement Snapshot
          </Link>
        </>
      }
    >
      <div className="space-y-8">
        <SessionCountReport />
        <SessionTrendReport />
        <MostParticipatedReport />
        <DashboardMetricsReport />
        {/* Add more reports here as we implement them */}
      </div>
      {/* <Reports /> */}
    </DashboardPageFrame>
  );
}
// src/app/reports/page.tsx
