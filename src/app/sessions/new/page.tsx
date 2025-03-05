import { prisma } from '@/lib/prisma';
import SessionForm from '../../../features/Sessions/ui/SessionForm';
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';

type Admission = {
  id: number;
  serviceUser: { id: number; name: string };
};

type Activity = {
  id: number;
  name: string;
};

export const metadata = {
  title: 'Start A Sessions',
};
export default async function NewSessionPage() {
  const [admissions, activities]: [Admission[], Activity[]] = await Promise.all(
    [
      prisma.admission.findMany({
        where: { dischargeDate: null }, // Fetch only active admissions
        include: { serviceUser: true },
      }),
      prisma.activity.findMany(),
    ],
  );

  return (
    <>
      <DashboardPageFrame
        // kind="status"
        title="New Session"
        // status={statuses}
        // pageActions={
        //   <Link href={`/sessions/new`} className="btn btn-primary">
        //     Create New
        //   </Link>
        // }
      >
        <SessionForm admissions={admissions} activities={activities} />
      </DashboardPageFrame>
    </>
  );
}

// src/app/sessions/new/page.tsx
