// src/app/api/reports/service-users/engagement-decline/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';
// import { format, subDays } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log(
//       'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
//       'Unauthorized access attempt',
//     );
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const period = (searchParams.get('period') as 'month' | 'year') || 'month';
//   const compareTo = searchParams.get('compareTo') as
//     | 'last'
//     | 'custom'
//     | undefined;
//   const customDate = searchParams.get('customDate');

//   if (!['month', 'year'].includes(period)) {
//     log('REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE', 'Invalid period', {
//       period,
//     });
//     return NextResponse.json(
//       { error: 'Invalid period. Use month or year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd, previousStart, previousEnd } =
//       getPeriodDates(period, compareTo, customDate);
//     log(
//       'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
//       'Fetching engagement decline',
//       { period, compareTo },
//     );

//     const buildDeclineData = async (start: Date, end: Date) => {
//       const sessions = await prisma.session.findMany({
//         where: { timeIn: { gte: start, lte: end } },
//         include: { admission: true },
//       });

//       const byDate: Record<string, number> = {};
//       sessions.forEach((session) => {
//         const date = format(
//           session.timeIn,
//           period === 'month' ? 'yyyy-MM-dd' : 'yyyy-MM',
//         );
//         byDate[date] = (byDate[date] || 0) + 1;
//       });

//       const dates =
//         period === 'month'
//           ? Array.from(
//               {
//                 length: Math.ceil(
//                   (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//                 ),
//               },
//               (_, i) => format(subDays(end, i), 'yyyy-MM-dd'),
//             ).reverse()
//           : Array.from({ length: 12 }, (_, i) =>
//               format(new Date(start.getFullYear(), i), 'yyyy-MM'),
//             );
//       return dates.map((date) => ({ date, count: byDate[date] || 0 }));
//     };

//     const [currentData, previousData] = await Promise.all([
//       buildDeclineData(currentStart, currentEnd),
//       buildDeclineData(previousStart, previousEnd),
//     ]);

//     const detectDecline = (data: { date: string; count: number }[]) => {
//       let declineStart = null;
//       let consecutiveDecline = 0;
//       for (let i = 1; i < data.length; i++) {
//         if (data[i].count < data[i - 1].count && data[i - 1].count > 0) {
//           consecutiveDecline++;
//           if (consecutiveDecline === 1) declineStart = data[i].date;
//           if (consecutiveDecline >= 3)
//             return { start: declineStart, ongoing: i === data.length - 1 };
//         } else {
//           consecutiveDecline = 0;
//           declineStart = null;
//         }
//       }
//       return null;
//     };

//     const currentDecline = detectDecline(currentData);
//     const previousDecline = detectDecline(previousData);

//     log(
//       'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
//       'Engagement decline fetched',
//       { currentDecline, previousDecline },
//     );
//     return NextResponse.json({
//       period,
//       currentData,
//       previousData,
//       decline: {
//         current: currentDecline
//           ? { start: currentDecline.start, ongoing: currentDecline.ongoing }
//           : null,
//         previous: previousDecline
//           ? { start: previousDecline.start, ongoing: previousDecline.ongoing }
//           : null,
//       },
//     });
//   } catch (error) {
//     log(
//       'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
//       'Failed to fetch engagement decline',
//       error,
//     );
//     return NextResponse.json(
//       { error: 'Failed to fetch engagement decline' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { getPeriodDates, log } from '@/lib/reportUtils';
import { format, subDays } from 'date-fns';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) =>
      log('REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as 'month' | 'year') || 'month';
  const compareTo = searchParams.get('compareTo') as
    | 'last'
    | 'custom'
    | undefined;
  const customDate = searchParams.get('customDate') as string | undefined;

  if (!['month', 'year'].includes(period)) {
    log('REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE', 'Invalid period', {
      period,
    });
    return NextResponse.json(
      { error: 'Invalid period. Use month or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getPeriodDates(period, compareTo, customDate);
    log(
      'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
      'Fetching engagement decline',
      {
        period,
        compareTo,
      },
    );

    const buildDeclineData = async (start: Date, end: Date) => {
      const sessions = await prisma.session.findMany({
        where: { timeIn: { gte: start, lte: end } },
        include: { admission: true },
      });

      const byDate: Record<string, number> = {};
      sessions.forEach((session) => {
        const date = format(
          session.timeIn,
          period === 'month' ? 'yyyy-MM-dd' : 'yyyy-MM',
        );
        byDate[date] = (byDate[date] || 0) + 1;
      });

      const dates =
        period === 'month'
          ? Array.from(
              {
                length: Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                ),
              },
              (_, i) => format(subDays(end, i), 'yyyy-MM-dd'),
            ).reverse()
          : Array.from({ length: 12 }, (_, i) =>
              format(new Date(start.getFullYear(), i), 'yyyy-MM'),
            );
      return dates.map((date) => ({ date, count: byDate[date] || 0 }));
    };

    const [currentData, previousData] = await Promise.all([
      buildDeclineData(currentStart, currentEnd),
      buildDeclineData(previousStart, previousEnd),
    ]);

    const detectDecline = (data: { date: string; count: number }[]) => {
      let declineStart: string | null = null;
      let consecutiveDecline = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i].count < data[i - 1].count && data[i - 1].count > 0) {
          consecutiveDecline++;
          if (consecutiveDecline === 1) declineStart = data[i].date;
          if (consecutiveDecline >= 3)
            return { start: declineStart, ongoing: i === data.length - 1 };
        } else {
          consecutiveDecline = 0;
          declineStart = null;
        }
      }
      return null;
    };

    const currentDecline = detectDecline(currentData);
    const previousDecline = detectDecline(previousData);

    log(
      'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
      'Engagement decline fetched',
      {
        currentDecline,
        previousDecline,
      },
    );
    return NextResponse.json({
      period,
      currentData,
      previousData,
      decline: {
        current: currentDecline
          ? { start: currentDecline.start, ongoing: currentDecline.ongoing }
          : null,
        previous: previousDecline
          ? { start: previousDecline.start, ongoing: previousDecline.ongoing }
          : null,
      },
    });
  } catch (error: unknown) {
    log(
      'REPORTS:SERVICE-USERS:ENGAGEMENT-DECLINE',
      'Failed to fetch engagement decline',
      error,
    );
    return NextResponse.json(
      { error: 'Failed to fetch engagement decline' },
      { status: 500 },
    );
  }
}

// Description: Detects when and how service user engagement declines, comparing current vs. past periods.

// Notes:
// Data: Provides daily/monthly counts for a Line Chart with decline points highlighted.
// Decline Detection: Flags 3+ consecutive drops.
// Auth: Secured with x-supabase-user.
