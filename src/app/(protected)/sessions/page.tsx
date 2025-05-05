import InfiniteSessionsList from '../../../features/Sessions/ui/InfiniteSessionsList';
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { BackdatedSessionButtons } from '@/features/Sessions/ui/BackdatedSessionButtons';
import Link from 'next/link';

export default async function SessionsPage() {
  return (
    <DashboardPageFrame
      title="Sessions"
      pageActions={
        <>
          {/* <Link href={`/sessions/new`} className="btn btn-primary">
            Create New
          </Link> */}
          <BackdatedSessionButtons />
        </>
      }
    >
      <InfiniteSessionsList />
    </DashboardPageFrame>
  );
}

// src/app/(protected)/sessions/page.tsx
