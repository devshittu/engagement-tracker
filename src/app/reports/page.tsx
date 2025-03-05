// app/reports/page.tsx
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import Reports from '@/features/Reports/Reports';
import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div>
      <DashboardPageFrame
        title="Activity Reports"
        pageActions={
          <>
            {/* <Link href={`#`} className="btn btn-primary">
          Export
        </Link> */}
          </>
        }
      >
        <Reports />
      </DashboardPageFrame>
    </div>
  );
}
