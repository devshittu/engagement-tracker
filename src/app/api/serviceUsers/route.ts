// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(request: Request) {
//   const url = new URL(request.url);
//   const status = url.searchParams.get('status') || undefined;

//   const where = status ? { status } : {};

//   const serviceUsers = await prisma.serviceUser.findMany({
//     where,
//     include: {
//       admissions: {
//         include: {
//           ward: true,
//           sessions: {
//             include: {
//               activity: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const serializedServiceUsers = serviceUsers.map((serviceUser) => ({
//     ...serviceUser,
//     createdAt: serviceUser.createdAt.toISOString(),
//     updatedAt: serviceUser.updatedAt
//       ? serviceUser.updatedAt.toISOString()
//       : null,
//     admissions: serviceUser.admissions.map((admission) => ({
//       ...admission,
//       admissionDate: admission.admissionDate.toISOString(),
//       dischargeDate: admission.dischargeDate
//         ? admission.dischargeDate.toISOString()
//         : null,
//       sessions: admission.sessions.map((session) => ({
//         ...session,
//         timeIn: session.timeIn.toISOString(),
//         timeOut: session.timeOut ? session.timeOut.toISOString() : null,
//       })),
//     })),
//   }));

//   return NextResponse.json(serializedServiceUsers);
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * pageSize;

  const sortBy = url.searchParams.get('sortBy') || 'name';
  const order = url.searchParams.get('order') || 'desc';
  const status = url.searchParams.get('status'); // 'admitted', 'discharged', or undefined
  const groupByWard = url.searchParams.get('groupByWard') === 'true'; // 'true' or 'false'

  try {
    // Build the where clause
    let whereClause: any = {};

    if (status === 'admitted' || status === 'discharged') {
      whereClause.admissions = {
        some: {
          dischargeDate: status === 'admitted' ? null : { not: null },
        },
      };
    }

    // Fetch total count for pagination
    const total = await prisma.serviceUser.count({
      where: whereClause,
    });

    // Fetch service users with pagination, sorting, and including latest admission
    const serviceUsers = await prisma.serviceUser.findMany({
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: order,
      },
      where: whereClause,
      include: {
        admissions: {
          orderBy: {
            admissionDate: 'desc',
          },
          take: 1,
          include: {
            ward: true,
          },
        },
      },
    });

    // Group by ward if required
    let groupedServiceUsers: any = serviceUsers;
    if (groupByWard) {
      groupedServiceUsers = {};
      for (const user of serviceUsers) {
        const wardName = user.admissions[0]?.ward?.name || 'No Ward';
        if (!groupedServiceUsers[wardName]) {
          groupedServiceUsers[wardName] = [];
        }
        groupedServiceUsers[wardName].push(user);
      }
    }

    // Serialize dates to ISO strings
    const serializedServiceUsers = JSON.parse(
      JSON.stringify(groupedServiceUsers),
    );

    return NextResponse.json({
      serviceUsers: serializedServiceUsers,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Failed to fetch service users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service users' },
      { status: 500 },
    );
  }
}

// src/app/api/serviceUsers/route.ts
