import { prisma } from '@/lib/prisma';
import { ServiceUser, ServiceUserStatus } from '@/types/serviceUser';
import EditServiceUserForm from '../../../../features/ServiceUsers/ui/EditServiceUserForm';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export default async function EditServiceUserPage({ params }: RouteParams) {
  // 1) Destructure and await the promised params
  const { id } = await params;
  const serviceUserId = parseInt(id, 10);
  if (isNaN(serviceUserId)) {
    return <p>Invalid serviceUser ID.</p>;
  }

  const serviceUser = await prisma.serviceUser.findUnique({
    where: { id: serviceUserId },
    include: {
      admissions: {
        include: {
          sessions: true,
          ward: true,
        },
      },
    },
  });

  if (!serviceUser) {
    return <p>ServiceUser not found.</p>;
  }

  // const serializedServiceUser: ServiceUser = {
  //   ...serviceUser,
  //   createdAt: serviceUser.createdAt.toISOString(),
  //   updatedAt: serviceUser.updatedAt?.toISOString() || null,
  //   sessions: [],
  //   status: serviceUser.status as ServiceUserStatus,
  // };
  const serializedServiceUser: ServiceUser = {
    ...serviceUser,
    createdAt: serviceUser.createdAt.toISOString(),
    updatedAt: serviceUser.updatedAt?.toISOString() || null,
    admissions: serviceUser.admissions?.map((admission) => ({
      ...admission,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() || null,
      serviceUser: {
        id: serviceUser.id,
        nhsNumber: serviceUser.nhsNumber,
        name: serviceUser.name,
        createdAt: serviceUser.createdAt.toISOString(),
        updatedAt: serviceUser.updatedAt?.toISOString() || null,
      },
    })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit ServiceUser</h1>
      <EditServiceUserForm serviceUser={serializedServiceUser} />
    </div>
  );
}

// src/app/serviceUsers/[id]/edit/page.tsx
