// src/app/api/reports/sessions/metrics/dashboard/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
// import { log } from '@/lib/reportUtils';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const now = new Date();
//     const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
//     const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
//     const previousWeekStart = startOfWeek(subWeeks(now, 1), {
//       weekStartsOn: 1,
//     });
//     const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

//     log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Fetching dashboard metrics');

//     const [
//       currentSessionCount,
//       previousSessionCount,
//       currentNewUsers,
//       previousNewUsers,
//       currentAdmissions,
//       previousAdmissions,
//     ] = await Promise.all([
//       prisma.session.count({
//         where: { timeIn: { gte: currentWeekStart, lte: currentWeekEnd } },
//       }),
//       prisma.session.count({
//         where: { timeIn: { gte: previousWeekStart, lte: previousWeekEnd } },
//       }),
//       prisma.serviceUser.count({
//         where: { createdAt: { gte: currentWeekStart, lte: currentWeekEnd } },
//       }),
//       prisma.serviceUser.count({
//         where: { createdAt: { gte: previousWeekStart, lte: previousWeekEnd } },
//       }),
//       prisma.admission.count({
//         where: {
//           admissionDate: { gte: currentWeekStart, lte: currentWeekEnd },
//         },
//       }),
//       prisma.admission.count({
//         where: {
//           admissionDate: { gte: previousWeekStart, lte: previousWeekEnd },
//         },
//       }),
//     ]);

//     const metrics = [
//       {
//         title: 'Sessions This Week',
//         value: currentSessionCount,
//         change:
//           previousSessionCount > 0
//             ? ((currentSessionCount - previousSessionCount) /
//                 previousSessionCount) *
//               100
//             : 0,
//         positive: currentSessionCount >= previousSessionCount,
//       },
//       {
//         title: 'New Service Users This Week',
//         value: currentNewUsers,
//         change:
//           previousNewUsers > 0
//             ? ((currentNewUsers - previousNewUsers) / previousNewUsers) * 100
//             : 0,
//         positive: currentNewUsers >= previousNewUsers,
//       },
//       {
//         title: 'Admissions This Week',
//         value: currentAdmissions,
//         change:
//           previousAdmissions > 0
//             ? ((currentAdmissions - previousAdmissions) / previousAdmissions) *
//               100
//             : 0,
//         positive: currentAdmissions >= previousAdmissions,
//       },
//     ];

//     log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Dashboard metrics fetched', {
//       metrics,
//     });
//     return NextResponse.json(metrics);
//   } catch (error) {
//     log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Failed to fetch metrics', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch metrics' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log('REPORTS:SESSIONS:METRICS:DASHBOARD', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Fetching dashboard metrics');

    const [
      currentSessionCount,
      previousSessionCount,
      currentNewUsers,
      previousNewUsers,
      currentAdmissions,
      previousAdmissions,
    ] = await Promise.all([
      prisma.session.count({
        where: { timeIn: { gte: currentWeekStart, lte: currentWeekEnd } },
      }),
      prisma.session.count({
        where: { timeIn: { gte: previousWeekStart, lte: previousWeekEnd } },
      }),
      prisma.serviceUser.count({
        where: { createdAt: { gte: currentWeekStart, lte: currentWeekEnd } },
      }),
      prisma.serviceUser.count({
        where: { createdAt: { gte: previousWeekStart, lte: previousWeekEnd } },
      }),
      prisma.admission.count({
        where: {
          admissionDate: { gte: currentWeekStart, lte: currentWeekEnd },
        },
      }),
      prisma.admission.count({
        where: {
          admissionDate: { gte: previousWeekStart, lte: previousWeekEnd },
        },
      }),
    ]);

    const metrics = [
      {
        title: 'Sessions This Week',
        value: currentSessionCount,
        change:
          previousSessionCount > 0
            ? ((currentSessionCount - previousSessionCount) / previousSessionCount) * 100
            : 0,
        positive: currentSessionCount >= previousSessionCount,
      },
      {
        title: 'New Service Users This Week',
        value: currentNewUsers,
        change:
          previousNewUsers > 0
            ? ((currentNewUsers - previousNewUsers) / previousNewUsers) * 100
            : 0,
        positive: currentNewUsers >= previousNewUsers,
      },
      {
        title: 'Admissions This Week',
        value: currentAdmissions,
        change:
          previousAdmissions > 0
            ? ((currentAdmissions - previousAdmissions) / previousAdmissions) * 100
            : 0,
        positive: currentAdmissions >= previousAdmissions,
      },
    ];

    log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Dashboard metrics fetched', { metrics });
    return NextResponse.json(metrics);
  } catch (error: unknown) {
    log('REPORTS:SESSIONS:METRICS:DASHBOARD', 'Failed to fetch metrics', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/sessions/metrics/dashboard/route.ts
