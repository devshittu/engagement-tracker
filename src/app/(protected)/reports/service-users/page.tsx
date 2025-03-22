// src/app/reports/service-users/page.tsx
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import ServiceUsersList from '@/features/ServiceUsers/ui/ServiceUsersList';

export default function ReportsServiceUsersPage() {
  return (
    <>
      <DashboardPageFrame title="Service Users Report" pageActions={<></>}>
        <ServiceUsersList showReportLinks={true} />
      </DashboardPageFrame>
    </>
  );
}
