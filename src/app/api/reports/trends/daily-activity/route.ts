// src/app/api/reports/trends/daily-activity/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';
// import { startOfMonth, endOfMonth, subMonths, format, subDays } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const activityIdStr = searchParams.get('activityId');
//   const monthStr = searchParams.get('month'); // YYYY-MM
//   const compareTo = searchParams.get('compareTo') as
//     | 'last'
//     | 'custom'
//     | undefined;
//   const customMonth = searchParams.get('customMonth'); // YYYY-MM

//   const activityId = activityIdStr ? parseInt(activityIdStr) : NaN;
//   if (isNaN(activityId)) {
//     log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Invalid activityId', { activityId });
//     return NextResponse.json({ error: 'Invalid activityId' }, { status: 400 });
//   }

//   const now = new Date();
//   const [year, month] = monthStr
//     ? monthStr.split('-').map(Number)
//     : [now.getFullYear(), now.getMonth() + 1];
//   if (isNaN(year) || isNaN(month)) {
//     log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Invalid month format', { monthStr });
//     return NextResponse.json(
//       { error: 'Invalid month format. Use YYYY-MM.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const currentStart = startOfMonth(new Date(year, month - 1));
//     const currentEnd = endOfMonth(new Date(year, month - 1));
//     const previousStart =
//       compareTo === 'custom' && customMonth
//         ? startOfMonth(new Date(customMonth))
//         : startOfMonth(subMonths(currentStart, 1));
//     const previousEnd =
//       compareTo === 'custom' && customMonth
//         ? endOfMonth(new Date(customMonth))
//         : endOfMonth(subMonths(currentEnd, 1));

//     log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Fetching daily activity trends', {
//       activityId,
//       month: `${year}-${month}`,
//     });

//     const [currentSessions, previousSessions, activity] = await Promise.all([
//       prisma.session.findMany({
//         where: {
//           activityLogId: activityId,
//           timeIn: { gte: currentStart, lte: currentEnd },
//         },
//       }),
//       prisma.session.findMany({
//         where: {
//           activityLogId: activityId,
//           timeIn: { gte: previousStart, lte: previousEnd },
//         },
//       }),
//       prisma.activityContinuityLog.findUnique({
//         where: { id: activityId },
//         include: { activity: { select: { name: true } } },
//       }),
//     ]);

//     if (!activity) {
//       log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Activity not found', {
//         activityId,
//       });
//       return NextResponse.json(
//         { error: 'Activity not found' },
//         { status: 404 },
//       );
//     }

//     const buildDailyData = (sessions: any[], start: Date, end: Date) => {
//       const byDate: Record<string, number> = {};
//       sessions.forEach((session) => {
//         const date = format(session.timeIn, 'yyyy-MM-dd');
//         byDate[date] = (byDate[date] || 0) + 1;
//       });

//       const days = Math.ceil(
//         (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//       );
//       return Array.from({ length: days }, (_, i) => {
//         const date = format(subDays(end, days - 1 - i), 'yyyy-MM-dd');
//         return { date, count: byDate[date] || 0 };
//       });
//     };

//     const currentData = buildDailyData(
//       currentSessions,
//       currentStart,
//       currentEnd,
//     );
//     const previousData = buildDailyData(
//       previousSessions,
//       previousStart,
//       previousEnd,
//     );

//     log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Daily activity trends fetched', {
//       activityName: activity.activity.name,
//     });
//     return NextResponse.json({
//       activity: { id: activityId, name: activity.activity.name },
//       current: {
//         month: format(currentStart, 'yyyy-MM'),
//         startDate: currentStart.toISOString(),
//         endDate: currentEnd.toISOString(),
//         data: currentData,
//       },
//       previous: {
//         month: format(previousStart, 'yyyy-MM'),
//         startDate: previousStart.toISOString(),
//         endDate: previousEnd.toISOString(),
//         data: previousData,
//       },
//     });
//   } catch (error) {
//     log(
//       'REPORTS:TRENDS:DAILY-ACTIVITY',
//       'Failed to fetch daily activity trends',
//       error,
//     );
//     return NextResponse.json(
//       { error: 'Failed to fetch daily activity trends' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';
import { startOfMonth, endOfMonth, subMonths, format, subDays } from 'date-fns';
import { authenticateRequest } from '@/lib/authMiddleware'; // Import the middleware

export async function GET(req: NextRequest) {
  // Step 1: Replace x-supabase-user with authenticateRequest
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:TRENDS:DAILY-ACTIVITY', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const activityIdStr = searchParams.get('activityId');
  const monthStr = searchParams.get('month'); // YYYY-MM
  const compareTo = searchParams.get('compareTo') as
    | 'last'
    | 'custom'
    | undefined;
  const customMonth = searchParams.get('customMonth') as string | undefined; // Step 2: Fix type to avoid 'string | null' error

  const activityId = activityIdStr ? parseInt(activityIdStr) : NaN;
  if (isNaN(activityId)) {
    log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Invalid activityId', { activityId });
    return NextResponse.json({ error: 'Invalid activityId' }, { status: 400 });
  }

  const now = new Date();
  const [year, month] = monthStr
    ? monthStr.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  if (isNaN(year) || isNaN(month)) {
    log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Invalid month format', { monthStr });
    return NextResponse.json(
      { error: 'Invalid month format. Use YYYY-MM.' },
      { status: 400 },
    );
  }

  try {
    const currentStart = startOfMonth(new Date(year, month - 1));
    const currentEnd = endOfMonth(new Date(year, month - 1));
    const previousStart =
      compareTo === 'custom' && customMonth
        ? startOfMonth(new Date(customMonth))
        : startOfMonth(subMonths(currentStart, 1));
    const previousEnd =
      compareTo === 'custom' && customMonth
        ? endOfMonth(new Date(customMonth))
        : endOfMonth(subMonths(currentEnd, 1));

    log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Fetching daily activity trends', {
      activityId,
      month: `${year}-${month}`,
    });

    const [currentSessions, previousSessions, activity] = await Promise.all([
      prisma.session.findMany({
        where: {
          activityLogId: activityId,
          timeIn: { gte: currentStart, lte: currentEnd },
        },
      }),
      prisma.session.findMany({
        where: {
          activityLogId: activityId,
          timeIn: { gte: previousStart, lte: previousEnd },
        },
      }),
      prisma.activityContinuityLog.findUnique({
        where: { id: activityId },
        include: { activity: { select: { name: true } } },
      }),
    ]);

    if (!activity) {
      log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Activity not found', {
        activityId,
      });
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 },
      );
    }

    const buildDailyData = (sessions: any[], start: Date, end: Date) => {
      const byDate: Record<string, number> = {};
      sessions.forEach((session) => {
        const date = format(session.timeIn, 'yyyy-MM-dd');
        byDate[date] = (byDate[date] || 0) + 1;
      });

      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return Array.from({ length: days }, (_, i) => {
        const date = format(subDays(end, days - 1 - i), 'yyyy-MM-dd');
        return { date, count: byDate[date] || 0 };
      });
    };

    const currentData = buildDailyData(
      currentSessions,
      currentStart,
      currentEnd,
    );
    const previousData = buildDailyData(
      previousSessions,
      previousStart,
      previousEnd,
    );

    log('REPORTS:TRENDS:DAILY-ACTIVITY', 'Daily activity trends fetched', {
      activityName: activity.activity.name,
    });
    return NextResponse.json({
      activity: { id: activityId, name: activity.activity.name },
      current: {
        month: format(currentStart, 'yyyy-MM'),
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
        data: currentData,
      },
      previous: {
        month: format(previousStart, 'yyyy-MM'),
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        data: previousData,
      },
    });
  } catch (error: unknown) {
    // Step 3: Type error as unknown
    log(
      'REPORTS:TRENDS:DAILY-ACTIVITY',
      'Failed to fetch daily activity trends',
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return NextResponse.json(
      { error: 'Failed to fetch daily activity trends' },
      { status: 500 },
    );
  }
}
// Description: Shows daily session counts for a specific activity over a month, with past period comparison.
// Notes:

// Data: Provides daily counts for a Line Chart (current vs. past month comparison).
// Comparison: Defaults to last month or allows custom month via customMonth.
// Auth: Secured with x-supabase-user.
