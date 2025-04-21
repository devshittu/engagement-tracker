// src/app/api/reports/staff/compare/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:STAFF:COMPARE', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const userId1 = searchParams.get('userId1');
//   const userId2 = searchParams.get('userId2');
//   const period =
//     (searchParams.get('period') as 'week' | 'month' | 'year') || 'month';

//   if (!userId1 || !userId2) {
//     log('REPORTS:STAFF:COMPARE', 'Missing user IDs', { userId1, userId2 });
//     return NextResponse.json(
//       { error: 'Both userId1 and userId2 are required' },
//       { status: 400 },
//     );
//   }

//   if (!['week', 'month', 'year'].includes(period)) {
//     log('REPORTS:STAFF:COMPARE', 'Invalid period', { period });
//     return NextResponse.json(
//       { error: 'Invalid period. Use week, month, or year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd } = getPeriodDates(period);
//     log('REPORTS:STAFF:COMPARE', 'Fetching staff comparison', {
//       userId1,
//       userId2,
//       period,
//     });

//     const [sessions1, sessions2, staffDetails] = await Promise.all([
//       prisma.session.findMany({
//         where: {
//           facilitatedById: userId1,
//           timeIn: { gte: currentStart, lte: currentEnd },
//         },
//         include: {
//           admission: true,
//           activityLog: { include: { activity: true } },
//         },
//       }),
//       prisma.session.findMany({
//         where: {
//           facilitatedById: userId2,
//           timeIn: { gte: currentStart, lte: currentEnd },
//         },
//         include: {
//           admission: true,
//           activityLog: { include: { activity: true } },
//         },
//       }),
//       prisma.user.findMany({
//         where: { id: { in: [userId1, userId2] } },
//         select: { id: true, name: true },
//       }),
//     ]);

//     const buildMetrics = (sessions: any[], staffId: string) => {
//       const uniqueServiceUsers = new Set(
//         sessions.map((s) => s.admission.serviceUserId),
//       ).size;
//       const uniqueActivities = new Set(
//         sessions.map((s) => s.activityLog.activityId),
//       ).size;
//       const groupSessions = sessions.filter((s) => s.type === 'GROUP').length;
//       const oneToOneSessions = sessions.filter(
//         (s) => s.type === 'ONE_TO_ONE',
//       ).length;
//       return {
//         staffId,
//         staffName:
//           staffDetails.find((s) => s.id === staffId)?.name || 'Unknown',
//         totalSessions: sessions.length,
//         groupSessions,
//         oneToOneSessions,
//         uniqueServiceUsers,
//         uniqueActivities,
//       };
//     };

//     const comparison = {
//       staff1: buildMetrics(sessions1, userId1),
//       staff2: buildMetrics(sessions2, userId2),
//     };

//     log('REPORTS:STAFF:COMPARE', 'Staff comparison fetched', {
//       staff1: comparison.staff1.staffName,
//       staff2: comparison.staff2.staffName,
//     });
//     return NextResponse.json({
//       period,
//       startDate: currentStart.toISOString(),
//       endDate: currentEnd.toISOString(),
//       comparison,
//     });
//   } catch (error) {
//     log('REPORTS:STAFF:COMPARE', 'Failed to fetch staff comparison', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch staff comparison' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPeriodDates, log } from '@/lib/reportUtils';
import { authenticateRequest } from '@/lib/authMiddleware'; // Import the middleware

export async function GET(req: NextRequest) {
  // Step 1: Replace x-supabase-user with authenticateRequest
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:STAFF:COMPARE', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const userId1 = searchParams.get('userId1') as string | undefined; // Step 2: Fix type to avoid 'string | null' error
  const userId2 = searchParams.get('userId2') as string | undefined; // Step 2: Fix type to avoid 'string | null' error
  const period =
    (searchParams.get('period') as 'week' | 'month' | 'year') || 'month';

  if (!userId1 || !userId2) {
    log('REPORTS:STAFF:COMPARE', 'Missing user IDs', { userId1, userId2 });
    return NextResponse.json(
      { error: 'Both userId1 and userId2 are required' },
      { status: 400 },
    );
  }

  if (!['week', 'month', 'year'].includes(period)) {
    log('REPORTS:STAFF:COMPARE', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use week, month, or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd } = getPeriodDates(period);
    log('REPORTS:STAFF:COMPARE', 'Fetching staff comparison', {
      userId1,
      userId2,
      period,
    });

    const [sessions1, sessions2, staffDetails] = await Promise.all([
      prisma.session.findMany({
        where: {
          facilitatedById: userId1,
          timeIn: { gte: currentStart, lte: currentEnd },
        },
        include: {
          admission: true,
          activityLog: { include: { activity: true } },
        },
      }),
      prisma.session.findMany({
        where: {
          facilitatedById: userId2,
          timeIn: { gte: currentStart, lte: currentEnd },
        },
        include: {
          admission: true,
          activityLog: { include: { activity: true } },
        },
      }),
      prisma.user.findMany({
        where: { id: { in: [userId1, userId2] } },
        select: { id: true, name: true },
      }),
    ]);

    const buildMetrics = (sessions: any[], staffId: string) => {
      const uniqueServiceUsers = new Set(
        sessions.map((s: any) => s.admission.serviceUserId),
      ).size;
      const uniqueActivities = new Set(
        sessions.map((s: any) => s.activityLog.activityId),
      ).size;
      const groupSessions = sessions.filter(
        (s: any) => s.type === 'GROUP',
      ).length;
      const oneToOneSessions = sessions.filter(
        (s: any) => s.type === 'ONE_TO_ONE',
      ).length;
      return {
        staffId,
        staffName:
          staffDetails.find((s) => s.id === staffId)?.name ?? 'Unknown', // Step 3: Add fallback for null name
        totalSessions: sessions.length,
        groupSessions,
        oneToOneSessions,
        uniqueServiceUsers,
        uniqueActivities,
      };
    };

    const comparison = {
      staff1: buildMetrics(sessions1, userId1),
      staff2: buildMetrics(sessions2, userId2),
    };

    log('REPORTS:STAFF:COMPARE', 'Staff comparison fetched', {
      staff1: comparison.staff1.staffName,
      staff2: comparison.staff2.staffName,
    });
    return NextResponse.json({
      period,
      startDate: currentStart.toISOString(),
      endDate: currentEnd.toISOString(),
      comparison,
    });
  } catch (error: unknown) {
    // Step 4: Type error as unknown
    log('REPORTS:STAFF:COMPARE', 'Failed to fetch staff comparison', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch staff comparison' },
      { status: 500 },
    );
  }
}
// Description: Compares two staff members’ session counts, service user coverage, and activity diversity over a period.
// Notes:

// Data: Provides metrics for a Dual Bar Chart (e.g., totalSessions, uniqueServiceUsers side-by-side for each staff).
// Metrics: Includes sessions, service users, and activity diversity.
// Auth: Secured with x-supabase-user.
