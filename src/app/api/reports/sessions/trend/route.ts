// src/app/api/reports/sessions/trend/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';
// import { format } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:SESSIONS:TREND', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const period =
//     (searchParams.get('period') as 'day' | 'week' | 'month' | 'year') || 'week';
//   const compareTo = searchParams.get('compareTo') as
//     | 'last'
//     | 'custom'
//     | undefined;
//   const customDate = searchParams.get('customDate');

//   if (!['day', 'week', 'month', 'year'].includes(period)) {
//     log('REPORTS:SESSIONS:TREND', 'Invalid period', { period });
//     return NextResponse.json(
//       { error: 'Invalid period. Allowed: day, week, month, year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd, previousStart, previousEnd } =
//       getPeriodDates(period, compareTo, customDate);
//     log('REPORTS:SESSIONS:TREND', 'Fetching session trends', {
//       period,
//       compareTo,
//     });

//     const buildTrendData = (sessions: any[]) => {
//       const groups: Record<string, number> = {};
//       sessions.forEach((session) => {
//         const date = new Date(session.timeIn);
//         const label =
//           period === 'day'
//             ? format(date, 'ha')
//             : period === 'week'
//               ? format(date, 'EEE')
//               : period === 'month'
//                 ? format(date, 'd')
//                 : format(date, 'MMM');
//         groups[label] = (groups[label] || 0) + 1;
//       });

//       const labels =
//         period === 'day'
//           ? Array.from({ length: 24 }, (_, i) =>
//               format(new Date(2020, 0, 1, i), 'ha'),
//             )
//           : period === 'week'
//             ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//             : period === 'month'
//               ? Array.from({ length: 31 }, (_, i) => `${i + 1}`)
//               : [
//                   'Jan',
//                   'Feb',
//                   'Mar',
//                   'Apr',
//                   'May',
//                   'Jun',
//                   'Jul',
//                   'Aug',
//                   'Sep',
//                   'Oct',
//                   'Nov',
//                   'Dec',
//                 ];
//       return labels.map((label) => ({ label, count: groups[label] || 0 }));
//     };

//     const [currentSessions, previousSessions] = await Promise.all([
//       prisma.session.findMany({
//         where: { timeIn: { gte: currentStart, lte: currentEnd } },
//       }),
//       prisma.session.findMany({
//         where: { timeIn: { gte: previousStart, lte: previousEnd } },
//       }),
//     ]);

//     const currentData = buildTrendData(currentSessions);
//     const previousData = buildTrendData(previousSessions);

//     const detectDecline = (data: { label: string; count: number }[]) => {
//       let declineStart = null;
//       let consecutiveDecline = 0;
//       for (let i = 1; i < data.length; i++) {
//         if (data[i].count < data[i - 1].count) {
//           consecutiveDecline++;
//           if (consecutiveDecline === 1) declineStart = data[i].label;
//           if (consecutiveDecline >= 3)
//             return { start: declineStart, ongoing: i === data.length - 1 };
//         } else {
//           consecutiveDecline = 0;
//           declineStart = null;
//         }
//       }
//       return null;
//     };

//     const decline = detectDecline(currentData);

//     log('REPORTS:SESSIONS:TREND', 'Session trends fetched', {
//       currentTotal: currentSessions.length,
//       previousTotal: previousSessions.length,
//     });
//     return NextResponse.json({
//       period,
//       currentData,
//       previousData,
//       decline: decline
//         ? { start: decline.start, ongoing: decline.ongoing }
//         : null,
//     });
//   } catch (error) {
//     log('REPORTS:SESSIONS:TREND', 'Failed to fetch trends', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch session trends' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { getPeriodDates, log } from '@/lib/reportUtils';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:SESSIONS:TREND', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period =
    (searchParams.get('period') as 'day' | 'week' | 'month' | 'year') || 'week';
  const compareTo = searchParams.get('compareTo') as
    | 'last'
    | 'custom'
    | undefined;
  const customDate = searchParams.get('customDate') as string | undefined;

  if (!['day', 'week', 'month', 'year'].includes(period)) {
    log('REPORTS:SESSIONS:TREND', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Allowed: day, week, month, year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getPeriodDates(period, compareTo, customDate);
    log('REPORTS:SESSIONS:TREND', 'Fetching session trends', {
      period,
      compareTo,
    });

    const buildTrendData = (sessions: any[]) => {
      const groups: Record<string, number> = {};
      sessions.forEach((session: { timeIn: Date }) => {
        const date = new Date(session.timeIn);
        const label =
          period === 'day'
            ? format(date, 'ha')
            : period === 'week'
              ? format(date, 'EEE')
              : period === 'month'
                ? format(date, 'd')
                : format(date, 'MMM');
        groups[label] = (groups[label] || 0) + 1;
      });

      const labels =
        period === 'day'
          ? Array.from({ length: 24 }, (_, i) =>
              format(new Date(2020, 0, 1, i), 'ha'),
            )
          : period === 'week'
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : period === 'month'
              ? Array.from({ length: 31 }, (_, i) => `${i + 1}`)
              : [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ];
      return labels.map((label) => ({ label, count: groups[label] || 0 }));
    };

    const [currentSessions, previousSessions] = await Promise.all([
      prisma.session.findMany({
        where: { timeIn: { gte: currentStart, lte: currentEnd } },
      }),
      prisma.session.findMany({
        where: { timeIn: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const currentData = buildTrendData(currentSessions);
    const previousData = buildTrendData(previousSessions);

    const detectDecline = (data: { label: string; count: number }[]) => {
      let declineStart: string | null = null;
      let consecutiveDecline = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i].count < data[i - 1].count) {
          consecutiveDecline++;
          if (consecutiveDecline === 1) declineStart = data[i].label;
          if (consecutiveDecline >= 3)
            return { start: declineStart, ongoing: i === data.length - 1 };
        } else {
          consecutiveDecline = 0;
          declineStart = null;
        }
      }
      return null;
    };

    const decline = detectDecline(currentData);

    log('REPORTS:SESSIONS:TREND', 'Session trends fetched', {
      currentTotal: currentSessions.length,
      previousTotal: previousSessions.length,
    });
    return NextResponse.json({
      period,
      currentData,
      previousData,
      decline: decline
        ? { start: decline.start, ongoing: decline.ongoing }
        : null,
    });
  } catch (error: unknown) {
    log('REPORTS:SESSIONS:TREND', 'Failed to fetch trends', error);
    return NextResponse.json(
      { error: 'Failed to fetch session trends' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/sessions/trend/route.ts
