// src/app/api/reports/facilitator/snapshot/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';
// import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:FACILITATOR:SNAPSHOT', 'Unauthorized access attempt');
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
//     log('REPORTS:FACILITATOR:SNAPSHOT', 'Invalid date format', {
//       startDateParam,
//     });
//     return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
//   }

//   try {
//     log('REPORTS:FACILITATOR:SNAPSHOT', 'Fetching facilitator snapshot', {
//       period,
//       startDate,
//       endDate,
//     });

//     const users = await prisma.user.findMany({
//       where: {
//         facilitatedSessions: {
//           some: {
//             timeIn: { gte: startDate, lte: endDate },
//             status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
//           },
//         },
//       },
//       include: {
//         facilitatedSessions: {
//           where: {
//             timeIn: { gte: startDate, lte: endDate },
//             status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
//           },
//           include: {
//             admission: {
//               include: { ward: true },
//             },
//           },
//         },
//       },
//     });

//     const snapshot = users.map((user) => {
//       const sessions = user.facilitatedSessions;
//       const groups = sessions.filter((s) => s.type === 'GROUP');
//       const oneToOnes = sessions.filter((s) => s.type === 'ONE_TO_ONE');

//       const groupOffered = groups.length;
//       const groupCompleted = groups.filter(
//         (s) => s.status === 'COMPLETED',
//       ).length;
//       const groupDeclined = groups.filter(
//         (s) => s.status === 'CANCELLED',
//       ).length;

//       const oneToOneOffered = oneToOnes.length;
//       const oneToOneCompleted = oneToOnes.filter(
//         (s) => s.status === 'COMPLETED',
//       ).length;
//       const oneToOneDeclined = oneToOnes.filter(
//         (s) => s.status === 'CANCELLED',
//       ).length;

//       const groupPercentCompleted = groupOffered
//         ? (groupCompleted / groupOffered) * 100
//         : 0;
//       const groupPercentDeclined = groupOffered
//         ? (groupDeclined / groupOffered) * 100
//         : 0;
//       const oneToOnePercentCompleted = oneToOneOffered
//         ? (oneToOneCompleted / oneToOneOffered) * 100
//         : 0;
//       const oneToOnePercentDeclined = oneToOneOffered
//         ? (oneToOneDeclined / oneToOneOffered) * 100
//         : 0;

//       const primaryWard =
//         sessions.length > 0 ? sessions[0].admission.ward.name : 'Unknown';

//       return {
//         userId: user.id,
//         email: user.email,
//         name: user.name,
//         primaryWard,
//         groups: {
//           offered: groupOffered,
//           completed: groupCompleted,
//           declined: groupDeclined,
//           percentCompleted: groupPercentCompleted,
//           percentDeclined: groupPercentDeclined,
//         },
//         oneToOnes: {
//           offered: oneToOneOffered,
//           completed: oneToOneCompleted,
//           declined: oneToOneDeclined,
//           percentCompleted: oneToOnePercentCompleted,
//           percentDeclined: oneToOnePercentDeclined,
//         },
//       };
//     });

//     const totalGroupsOffered = snapshot.reduce(
//       (sum, user) => sum + user.groups.offered,
//       0,
//     );
//     const totalGroupsCompleted = snapshot.reduce(
//       (sum, user) => sum + user.groups.completed,
//       0,
//     );
//     const totalGroupsDeclined = snapshot.reduce(
//       (sum, user) => sum + user.groups.declined,
//       0,
//     );
//     const totalOneToOnesOffered = snapshot.reduce(
//       (sum, user) => sum + user.oneToOnes.offered,
//       0,
//     );
//     const totalOneToOnesCompleted = snapshot.reduce(
//       (sum, user) => sum + user.oneToOnes.completed,
//       0,
//     );
//     const totalOneToOnesDeclined = snapshot.reduce(
//       (sum, user) => sum + user.oneToOnes.declined,
//       0,
//     );

//     const response = {
//       period,
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(),
//       snapshot,
//       totals: {
//         groups: {
//           offered: totalGroupsOffered,
//           completed: totalGroupsCompleted,
//           declined: totalGroupsDeclined,
//           percentCompleted: totalGroupsOffered
//             ? (totalGroupsCompleted / totalGroupsOffered) * 100
//             : 0,
//           percentDeclined: totalGroupsOffered
//             ? (totalGroupsDeclined / totalGroupsOffered) * 100
//             : 0,
//         },
//         oneToOnes: {
//           offered: totalOneToOnesOffered,
//           completed: totalOneToOnesCompleted,
//           declined: totalOneToOnesDeclined,
//           percentCompleted: totalOneToOnesOffered
//             ? (totalOneToOnesCompleted / totalOneToOnesOffered) * 100
//             : 0,
//           percentDeclined: totalOneToOnesOffered
//             ? (totalOneToOnesDeclined / totalOneToOnesOffered) * 100
//             : 0,
//         },
//       },
//     };

//     log('REPORTS:FACILITATOR:SNAPSHOT', 'Data prepared', {
//       userCount: snapshot.length,
//       sample: snapshot.slice(0, 1),
//     });
//     return NextResponse.json(response);
//   } catch (error) {
//     log('REPORTS:FACILITATOR:SNAPSHOT', 'Failed to fetch data', {
//       error: error.message,
//     });
//     return NextResponse.json(
//       { error: 'Failed to fetch facilitator snapshot' },
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
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log('REPORTS:FACILITATOR:SNAPSHOT', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'month';
  const startDateParam = searchParams.get('startDate') as string | undefined;

  let startDate: Date;
  let endDate: Date;

  try {
    startDate = startDateParam ? parseISO(startDateParam) : startOfMonth(new Date());
    endDate = period === 'month' ? endOfMonth(startDate) : startDate;
  } catch (error: unknown) {
    log('REPORTS:FACILITATOR:SNAPSHOT', 'Invalid date format', { startDateParam });
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  try {
    log('REPORTS:FACILITATOR:SNAPSHOT', 'Fetching facilitator snapshot', {
      period,
      startDate,
      endDate,
    });

    const users = await prisma.user.findMany({
      where: {
        facilitatedSessions: {
          some: {
            timeIn: { gte: startDate, lte: endDate },
            status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
          },
        },
      },
      include: {
        facilitatedSessions: {
          where: {
            timeIn: { gte: startDate, lte: endDate },
            status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
          },
          include: {
            admission: {
              include: { ward: true },
            },
          },
        },
      },
    });

    const snapshot = users.map((user) => {
      const sessions = user.facilitatedSessions;
      const groups = sessions.filter((s) => s.type === 'GROUP');
      const oneToOnes = sessions.filter((s) => s.type === 'ONE_TO_ONE');

      const groupOffered = groups.length;
      const groupCompleted = groups.filter((s) => s.status === 'COMPLETED').length;
      const groupDeclined = groups.filter((s) => s.status === 'CANCELLED').length;

      const oneToOneOffered = oneToOnes.length;
      const oneToOneCompleted = oneToOnes.filter((s) => s.status === 'COMPLETED').length;
      const oneToOneDeclined = oneToOnes.filter((s) => s.status === 'CANCELLED').length;

      const groupPercentCompleted = groupOffered ? (groupCompleted / groupOffered) * 100 : 0;
      const groupPercentDeclined = groupOffered ? (groupDeclined / groupOffered) * 100 : 0;
      const oneToOnePercentCompleted = oneToOneOffered
        ? (oneToOneCompleted / oneToOneOffered) * 100
        : 0;
      const oneToOnePercentDeclined = oneToOneOffered
        ? (oneToOneDeclined / oneToOneOffered) * 100
        : 0;

      const primaryWard =
        sessions.length > 0 ? sessions[0].admission.ward.name : 'Unknown';

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        primaryWard,
        groups: {
          offered: groupOffered,
          completed: groupCompleted,
          declined: groupDeclined,
          percentCompleted: groupPercentCompleted,
          percentDeclined: groupPercentDeclined,
        },
        oneToOnes: {
          offered: oneToOneOffered,
          completed: oneToOneCompleted,
          declined: oneToOneDeclined,
          percentCompleted: oneToOnePercentCompleted,
          percentDeclined: oneToOnePercentDeclined,
        },
      };
    });

    const totalGroupsOffered = snapshot.reduce(
      (sum, user) => sum + user.groups.offered,
      0,
    );
    const totalGroupsCompleted = snapshot.reduce(
      (sum, user) => sum + user.groups.completed,
      0,
    );
    const totalGroupsDeclined = snapshot.reduce(
      (sum, user) => sum + user.groups.declined,
      0,
    );
    const totalOneToOnesOffered = snapshot.reduce(
      (sum, user) => sum + user.oneToOnes.offered,
      0,
    );
    const totalOneToOnesCompleted = snapshot.reduce(
      (sum, user) => sum + user.oneToOnes.completed,
      0,
    );
    const totalOneToOnesDeclined = snapshot.reduce(
      (sum, user) => sum + user.oneToOnes.declined,
      0,
    );

    const response = {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      snapshot,
      totals: {
        groups: {
          offered: totalGroupsOffered,
          completed: totalGroupsCompleted,
          declined: totalGroupsDeclined,
          percentCompleted: totalGroupsOffered
            ? (totalGroupsCompleted / totalGroupsOffered) * 100
            : 0,
          percentDeclined: totalGroupsOffered
            ? (totalGroupsDeclined / totalGroupsOffered) * 100
            : 0,
        },
        oneToOnes: {
          offered: totalOneToOnesOffered,
          completed: totalOneToOnesCompleted,
          declined: totalOneToOnesDeclined,
          percentCompleted: totalOneToOnesOffered
            ? (totalOneToOnesCompleted / totalOneToOnesOffered) * 100
            : 0,
          percentDeclined: totalOneToOnesOffered
            ? (totalOneToOnesDeclined / totalOneToOnesOffered) * 100
            : 0,
        },
      },
    };

    log('REPORTS:FACILITATOR:SNAPSHOT', 'Data prepared', {
      userCount: snapshot.length,
      sample: snapshot.slice(0, 1),
    });
    return NextResponse.json(response);
  } catch (error: unknown) {
    log('REPORTS:FACILITATOR:SNAPSHOT', 'Failed to fetch data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to fetch facilitator snapshot' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/facilitator/snapshot/route.ts