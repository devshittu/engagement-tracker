import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import ServiceUsersList from '../../features/ServiceUsers/ui/ServiceUsersList';
import Link from 'next/link';

export default function ServiceUsersPage() {
  return (
    <>
      <DashboardPageFrame
        title="Service Users"
        pageActions={
          <>
            {/* Add Service User Button */}
            <Link href="/serviceUsers/new" className="btn btn-primary">
              + Add Service User
            </Link>
          </>
        }
      >
        <ServiceUsersList />
      </DashboardPageFrame>
    </>
  );
}
// src/app/serviceUsers/page.tsx
