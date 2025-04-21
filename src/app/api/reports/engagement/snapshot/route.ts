// src/app/api/reports/engagement/snapshot/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';
// import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const period = searchParams.get('period') || 'month';
//   const startDateParam = searchParams.get('startDate');

//   let startDate: Date;
//   let endDate: Date;

//   try {
//     startDate = startDateParam
//       ? parseISO(startDateParam)
//       : startOfMonth(new Date());
//     endDate = period === 'month' ? endOfMonth(startDate) : startDate;
//   } catch (error) {
//     log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Invalid date format', {
//       startDateParam,
//     });
//     return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
//   }

//   try {
//     log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Fetching engagement snapshot', {
//       period,
//       startDate,
//       endDate,
//     });

//     const wards = await prisma.ward.findMany({
//       include: {
//         admissions: {
//           where: {
//             AND: [
//               { admissionDate: { lte: endDate } }, // Admitted on or before endDate
//               {
//                 OR: [
//                   { dischargeDate: null }, // Still admitted
//                   { dischargeDate: { gte: startDate } }, // Discharged on or after startDate
//                 ],
//               },
//             ],
//           },
//           include: {
//             sessions: {
//               where: {
//                 timeIn: { gte: startDate, lte: endDate },
//                 status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
//               },
//             },
//           },
//         },
//       },
//     });

//     const snapshot = wards.map((ward) => {
//       const admissions = ward.admissions;
//       const serviceUsers = [...new Set(admissions.map((a) => a.serviceUserId))]
//         .length;

//       const sessions = admissions.flatMap((a) => a.sessions);
//       const groups = sessions.filter((s) => s.type === 'GROUP');
//       const oneToOnes = sessions.filter((s) => s.type === 'ONE_TO_ONE');

//       const groupOffered = groups.length;
//       const groupAttended = groups.filter(
//         (s) => s.status === 'COMPLETED',
//       ).length;
//       const groupDeclined = groups.filter(
//         (s) => s.status === 'CANCELLED',
//       ).length;

//       const oneToOneOffered = oneToOnes.length;
//       const oneToOneAttended = oneToOnes.filter(
//         (s) => s.status === 'COMPLETED',
//       ).length;
//       const oneToOneDeclined = oneToOnes.filter(
//         (s) => s.status === 'CANCELLED',
//       ).length;

//       const groupPercentAttended = groupOffered
//         ? (groupAttended / groupOffered) * 100
//         : 0;
//       const groupPercentDeclined = groupOffered
//         ? (groupDeclined / groupOffered) * 100
//         : 0;
//       const oneToOnePercentAttended = oneToOneOffered
//         ? (oneToOneAttended / oneToOneOffered) * 100
//         : 0;
//       const oneToOnePercentDeclined = oneToOneOffered
//         ? (oneToOneDeclined / oneToOneOffered) * 100
//         : 0;

//       return {
//         wardId: ward.id,
//         wardName: ward.name,
//         serviceUsers,
//         groups: {
//           offered: groupOffered,
//           attended: groupAttended,
//           declined: groupDeclined,
//           percentAttended: groupPercentAttended,
//           percentDeclined: groupPercentDeclined,
//         },
//         oneToOnes: {
//           offered: oneToOneOffered,
//           attended: oneToOneAttended,
//           declined: oneToOneDeclined,
//           percentAttended: oneToOnePercentAttended,
//           percentDeclined: oneToOnePercentDeclined,
//         },
//       };
//     });

//     const totalServiceUsers = snapshot.reduce(
//       (sum, ward) => sum + ward.serviceUsers,
//       0,
//     );
//     const totalGroupsOffered = snapshot.reduce(
//       (sum, ward) => sum + ward.groups.offered,
//       0,
//     );
//     const totalGroupsAttended = snapshot.reduce(
//       (sum, ward) => sum + ward.groups.attended,
//       0,
//     );
//     const totalGroupsDeclined = snapshot.reduce(
//       (sum, ward) => sum + ward.groups.declined,
//       0,
//     );
//     const totalOneToOnesOffered = snapshot.reduce(
//       (sum, ward) => sum + ward.oneToOnes.offered,
//       0,
//     );
//     const totalOneToOnesAttended = snapshot.reduce(
//       (sum, ward) => sum + ward.oneToOnes.attended,
//       0,
//     );
//     const totalOneToOnesDeclined = snapshot.reduce(
//       (sum, ward) => sum + ward.oneToOnes.declined,
//       0,
//     );

//     const response = {
//       period,
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(),
//       snapshot,
//       totals: {
//         serviceUsers: totalServiceUsers,
//         groups: {
//           offered: totalGroupsOffered,
//           attended: totalGroupsAttended,
//           declined: totalGroupsDeclined,
//           percentAttended: totalGroupsOffered
//             ? (totalGroupsAttended / totalGroupsOffered) * 100
//             : 0,
//           percentDeclined: totalGroupsOffered
//             ? (totalGroupsDeclined / totalGroupsOffered) * 100
//             : 0,
//         },
//         oneToOnes: {
//           offered: totalOneToOnesOffered,
//           attended: totalOneToOnesAttended,
//           declined: totalOneToOnesDeclined,
//           percentAttended: totalOneToOnesOffered
//             ? (totalOneToOnesAttended / totalOneToOnesOffered) * 100
//             : 0,
//           percentDeclined: totalOneToOnesOffered
//             ? (totalOneToOnesDeclined / totalOneToOnesOffered) * 100
//             : 0,
//         },
//       },
//     };

//     log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Data prepared', {
//       wardCount: snapshot.length,
//       sample: snapshot.slice(0, 1),
//     });
//     return NextResponse.json(response);
//   } catch (error) {
//     log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Failed to fetch data', {
//       error: error.message,
//     });
//     return NextResponse.json(
//       { error: 'Failed to fetch engagement snapshot' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { log } from '@/lib/reportUtils';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:ENGAGEMENT:SNAPSHOT', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'month';
  const startDateParam = searchParams.get('startDate') as string | undefined;

  let startDate: Date;
  let endDate: Date;

  try {
    startDate = startDateParam
      ? parseISO(startDateParam)
      : startOfMonth(new Date());
    endDate = period === 'month' ? endOfMonth(startDate) : startDate;
  } catch (error: unknown) {
    log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Invalid date format', {
      startDateParam,
    });
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  try {
    log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Fetching engagement snapshot', {
      period,
      startDate,
      endDate,
    });

    const wards = await prisma.ward.findMany({
      include: {
        admissions: {
          where: {
            AND: [
              { admissionDate: { lte: endDate } },
              {
                OR: [
                  { dischargeDate: null },
                  { dischargeDate: { gte: startDate } },
                ],
              },
            ],
          },
          include: {
            sessions: {
              where: {
                timeIn: { gte: startDate, lte: endDate },
                status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
              },
            },
          },
        },
      },
    });

    const snapshot = wards.map((ward) => {
      const admissions = ward.admissions;
      const serviceUsers = [...new Set(admissions.map((a) => a.serviceUserId))]
        .length;

      const sessions = admissions.flatMap((a) => a.sessions);
      const groups = sessions.filter((s) => s.type === 'GROUP');
      const oneToOnes = sessions.filter((s) => s.type === 'ONE_TO_ONE');

      const groupOffered = groups.length;
      const groupAttended = groups.filter(
        (s) => s.status === 'COMPLETED',
      ).length;
      const groupDeclined = groups.filter(
        (s) => s.status === 'CANCELLED',
      ).length;

      const oneToOneOffered = oneToOnes.length;
      const oneToOneAttended = oneToOnes.filter(
        (s) => s.status === 'COMPLETED',
      ).length;
      const oneToOneDeclined = oneToOnes.filter(
        (s) => s.status === 'CANCELLED',
      ).length;

      const groupPercentAttended = groupOffered
        ? (groupAttended / groupOffered) * 100
        : 0;
      const groupPercentDeclined = groupOffered
        ? (groupDeclined / groupOffered) * 100
        : 0;
      const oneToOnePercentAttended = oneToOneOffered
        ? (oneToOneAttended / oneToOneOffered) * 100
        : 0;
      const oneToOnePercentDeclined = oneToOneOffered
        ? (oneToOneDeclined / oneToOneOffered) * 100
        : 0;

      return {
        wardId: ward.id,
        wardName: ward.name,
        serviceUsers,
        groups: {
          offered: groupOffered,
          attended: groupAttended,
          declined: groupDeclined,
          percentAttended: groupPercentAttended,
          percentDeclined: groupPercentDeclined,
        },
        oneToOnes: {
          offered: oneToOneOffered,
          attended: oneToOneAttended,
          declined: oneToOneDeclined,
          percentAttended: oneToOnePercentAttended,
          percentDeclined: oneToOnePercentDeclined,
        },
      };
    });

    const totalServiceUsers = snapshot.reduce(
      (sum, ward) => sum + ward.serviceUsers,
      0,
    );
    const totalGroupsOffered = snapshot.reduce(
      (sum, ward) => sum + ward.groups.offered,
      0,
    );
    const totalGroupsAttended = snapshot.reduce(
      (sum, ward) => sum + ward.groups.attended,
      0,
    );
    const totalGroupsDeclined = snapshot.reduce(
      (sum, ward) => sum + ward.groups.declined,
      0,
    );
    const totalOneToOnesOffered = snapshot.reduce(
      (sum, ward) => sum + ward.oneToOnes.offered,
      0,
    );
    const totalOneToOnesAttended = snapshot.reduce(
      (sum, ward) => sum + ward.oneToOnes.attended,
      0,
    );
    const totalOneToOnesDeclined = snapshot.reduce(
      (sum, ward) => sum + ward.oneToOnes.declined,
      0,
    );

    const response = {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      snapshot,
      totals: {
        serviceUsers: totalServiceUsers,
        groups: {
          offered: totalGroupsOffered,
          attended: totalGroupsAttended,
          declined: totalGroupsDeclined,
          percentAttended: totalGroupsOffered
            ? (totalGroupsAttended / totalGroupsOffered) * 100
            : 0,
          percentDeclined: totalGroupsOffered
            ? (totalGroupsDeclined / totalGroupsOffered) * 100
            : 0,
        },
        oneToOnes: {
          offered: totalOneToOnesOffered,
          attended: totalOneToOnesAttended,
          declined: totalOneToOnesDeclined,
          percentAttended: totalOneToOnesOffered
            ? (totalOneToOnesAttended / totalOneToOnesOffered) * 100
            : 0,
          percentDeclined: totalOneToOnesOffered
            ? (totalOneToOnesDeclined / totalOneToOnesOffered) * 100
            : 0,
        },
      },
    };

    log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Data prepared', {
      wardCount: snapshot.length,
      sample: snapshot.slice(0, 1),
    });
    return NextResponse.json(response);
  } catch (error: unknown) {
    log('REPORTS:ENGAGEMENT:SNAPSHOT', 'Failed to fetch data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to fetch engagement snapshot' },
      { status: 500 },
    );
  }
}
