// src/app/reports/service-users/[serviceUserId]/page.tsx
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { ServiceUserAdmissionsReport } from '@/features/Reports/components/ServiceUserAdmissionsReport';
import { prisma } from '@/lib/prisma';

type ServiceUserAdmissionsPageProps = {
  params: { serviceUserId: string };
};

export default async function ServiceUserAdmissionsPage({
  params,
}: ServiceUserAdmissionsPageProps) {
  const serviceUserId = parseInt(params.serviceUserId, 10);

  if (isNaN(serviceUserId)) {
    return (
      <>
        <DashboardPageFrame title="Invalid Service User ID" pageActions={<></>}>
          <p>Invalid service user ID provided.</p>
        </DashboardPageFrame>
      </>
    );
  }

  // Fetch the service user's name from the database
  const serviceUser = await prisma.serviceUser.findUnique({
    where: { id: serviceUserId },
    select: { name: true },
  });

  const title = serviceUser
    ? `Admission History for ${serviceUser.name}`
    : `Admission History for Service User ${params.serviceUserId}`;

  return (
    <>
      <DashboardPageFrame title={title} pageActions={<></>}>
        <ServiceUserAdmissionsReport serviceUserId={params.serviceUserId} />
      </DashboardPageFrame>
    </>
  );
}
