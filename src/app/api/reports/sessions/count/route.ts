// src/app/api/reports/sessions/count/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:SESSIONS:COUNT', 'Unauthorized access attempt');
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
//   const groupBy = searchParams.get('groupBy');

//   if (!['day', 'week', 'month', 'year'].includes(period)) {
//     log('REPORTS:SESSIONS:COUNT', 'Invalid period', { period });
//     return NextResponse.json(
//       { error: 'Invalid period. Use day, week, month, or year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd, previousStart, previousEnd } =
//       getPeriodDates(period, compareTo, customDate);
//     log('REPORTS:SESSIONS:COUNT', 'Fetching session counts', {
//       period,
//       compareTo,
//     });

//     if (groupBy) {
//       const allowedGroupByFields = ['admissionId', 'activityLogId'];
//       if (!allowedGroupByFields.includes(groupBy)) {
//         log('REPORTS:SESSIONS:COUNT', 'Invalid groupBy', { groupBy });
//         return NextResponse.json(
//           {
//             error: `Invalid groupBy. Allowed: ${allowedGroupByFields.join(', ')}`,
//           },
//           { status: 400 },
//         );
//       }

//       const [currentGroup, previousGroup] = await Promise.all([
//         prisma.session.groupBy({
//           by: [groupBy as any],
//           _count: { id: true },
//           where: { timeIn: { gte: currentStart, lte: currentEnd } },
//           orderBy: { [groupBy]: 'asc' },
//         }),
//         prisma.session.groupBy({
//           by: [groupBy as any],
//           _count: { id: true },
//           where: { timeIn: { gte: previousStart, lte: previousEnd } },
//           orderBy: { [groupBy]: 'asc' },
//         }),
//       ]);

//       return NextResponse.json({
//         period,
//         groupBy,
//         current: currentGroup,
//         previous: previousGroup,
//       });
//     }

//     const [currentAggregate, previousAggregate] = await Promise.all([
//       prisma.session.aggregate({
//         _count: { id: true },
//         where: { timeIn: { gte: currentStart, lte: currentEnd } },
//       }),
//       prisma.session.aggregate({
//         _count: { id: true },
//         where: { timeIn: { gte: previousStart, lte: previousEnd } },
//       }),
//     ]);

//     const trend = {
//       countDifference: currentAggregate._count.id - previousAggregate._count.id,
//       percentageChange:
//         previousAggregate._count.id > 0
//           ? ((currentAggregate._count.id - previousAggregate._count.id) /
//               previousAggregate._count.id) *
//             100
//           : 0,
//     };

//     log('REPORTS:SESSIONS:COUNT', 'Session counts fetched', {
//       current: currentAggregate._count.id,
//       previous: previousAggregate._count.id,
//     });
//     return NextResponse.json({
//       period,
//       current: currentAggregate,
//       previous: previousAggregate,
//       trend,
//     });
//   } catch (error) {
//     log('REPORTS:SESSIONS:COUNT', 'Failed to fetch session counts', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch session counts' },
//       { status: 500 },
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { getPeriodDates, log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log('REPORTS:SESSIONS:COUNT', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as 'day' | 'week' | 'month' | 'year') || 'week';
  const compareTo = searchParams.get('compareTo') as 'last' | 'custom' | undefined;
  const customDate = searchParams.get('customDate') as string | undefined;
  const groupBy = searchParams.get('groupBy');

  if (!['day', 'week', 'month', 'year'].includes(period)) {
    log('REPORTS:SESSIONS:COUNT', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use day, week, month, or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodDates(
      period,
      compareTo,
      customDate,
    );
    log('REPORTS:SESSIONS:COUNT', 'Fetching session counts', {
      period,
      compareTo,
    });

    if (groupBy) {
      const allowedGroupByFields = ['admissionId', 'activityLogId'];
      if (!allowedGroupByFields.includes(groupBy)) {
        log('REPORTS:SESSIONS:COUNT', 'Invalid groupBy', { groupBy });
        return NextResponse.json(
          {
            error: `Invalid groupBy. Allowed: ${allowedGroupByFields.join(', ')}`,
          },
          { status: 400 },
        );
      }

      const [currentGroup, previousGroup] = await Promise.all([
        prisma.session.groupBy({
          by: [groupBy as 'admissionId' | 'activityLogId'],
          _count: { id: true },
          where: { timeIn: { gte: currentStart, lte: currentEnd } },
          orderBy: { _count: { id: 'asc' } }, // Fixed: Order by the count of id
        }),
        prisma.session.groupBy({
          by: [groupBy as 'admissionId' | 'activityLogId'],
          _count: { id: true },
          where: { timeIn: { gte: previousStart, lte: previousEnd } },
          orderBy: { _count: { id: 'asc' } }, // Fixed: Order by the count of id
        }),
      ]);

      return NextResponse.json({
        period,
        groupBy,
        current: currentGroup,
        previous: previousGroup,
      });
    }

    const [currentAggregate, previousAggregate] = await Promise.all([
      prisma.session.aggregate({
        _count: { id: true },
        where: { timeIn: { gte: currentStart, lte: currentEnd } },
      }),
      prisma.session.aggregate({
        _count: { id: true },
        where: { timeIn: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const trend = {
      countDifference: currentAggregate._count.id - previousAggregate._count.id,
      percentageChange:
        previousAggregate._count.id > 0
          ? ((currentAggregate._count.id - previousAggregate._count.id) /
              previousAggregate._count.id) *
            100
          : 0,
    };

    log('REPORTS:SESSIONS:COUNT', 'Session counts fetched', {
      current: currentAggregate._count.id,
      previous: previousAggregate._count.id,
    });
    return NextResponse.json({
      period,
      current: currentAggregate,
      previous: previousAggregate,
      trend,
    });
  } catch (error: unknown) {
    log('REPORTS:SESSIONS:COUNT', 'Failed to fetch session counts', error);
    return NextResponse.json(
      { error: 'Failed to fetch session counts' },
      { status: 500 },
    );
  }
}