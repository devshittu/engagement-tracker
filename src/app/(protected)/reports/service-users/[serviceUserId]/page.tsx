// src/app/reports/service-users/[serviceUserId]/page.tsx

import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { ServiceUserAdmissionsReport } from '@/features/Reports/components/ServiceUserAdmissionsReport';
import { prisma } from '@/lib/prisma';

// Define params as a Promise for Server Components
type ServiceUserAdmissionsPageProps = {
  params: Promise<{ serviceUserId: string }>;
};

// Make the function async to await the params
export default async function ServiceUserAdmissionsPage({
  params,
}: ServiceUserAdmissionsPageProps) {
  const { serviceUserId: serviceUserIdStr } = await params; // Await the Promise to get params
  const serviceUserId = parseInt(serviceUserIdStr, 10);

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
    : `Admission History for Service User ${serviceUserIdStr}`;

  return (
    <>
      <DashboardPageFrame title={title} pageActions={<></>}>
        <ServiceUserAdmissionsReport serviceUserId={serviceUserIdStr} />
      </DashboardPageFrame>
    </>
  );
}
