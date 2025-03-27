// src/app/api/reports/wards/trend/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';
// import { format, subDays } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:WARDS:TREND', 'Unauthorized access attempt');
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
//     log('REPORTS:WARDS:TREND', 'Invalid period', { period });
//     return NextResponse.json(
//       { error: 'Invalid period. Use month or year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd, previousStart, previousEnd } =
//       getPeriodDates(period, compareTo, customDate);
//     log('REPORTS:WARDS:TREND', 'Fetching ward activity trends', {
//       period,
//       compareTo,
//     });

//     const buildTrendData = async (start: Date, end: Date) => {
//       const sessions = await prisma.session.findMany({
//         where: { timeIn: { gte: start, lte: end } },
//         include: { admission: { include: { ward: true } } },
//       });

//       const byWardAndDate: Record<string, Record<string, number>> = {};
//       sessions.forEach((session) => {
//         const wardId = session.admission.ward.id;
//         const date = format(
//           session.timeIn,
//           period === 'month' ? 'yyyy-MM-dd' : 'yyyy-MM',
//         );
//         if (!byWardAndDate[wardId]) byWardAndDate[wardId] = {};
//         byWardAndDate[wardId][date] = (byWardAndDate[wardId][date] || 0) + 1;
//       });

//       const wards = await prisma.ward.findMany({
//         where: { id: { in: Object.keys(byWardAndDate).map(Number) } },
//         select: { id: true, name: true },
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

//       return wards.map((ward) => ({
//         wardId: ward.id,
//         wardName: ward.name,
//         trend: dates.map((date) => ({
//           date,
//           count: byWardAndDate[ward.id]?.[date] || 0,
//         })),
//       }));
//     };

//     const [currentData, previousData] = await Promise.all([
//       buildTrendData(currentStart, currentEnd),
//       buildTrendData(previousStart, previousEnd),
//     ]);

//     log('REPORTS:WARDS:TREND', 'Ward activity trends fetched', {
//       wards: currentData.length,
//     });
//     return NextResponse.json({
//       period,
//       current: {
//         startDate: currentStart.toISOString(),
//         endDate: currentEnd.toISOString(),
//         data: currentData,
//       },
//       previous: {
//         startDate: previousStart.toISOString(),
//         endDate: previousEnd.toISOString(),
//         data: previousData,
//       },
//     });
//   } catch (error) {
//     log('REPORTS:WARDS:TREND', 'Failed to fetch ward activity trends', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch ward activity trends' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPeriodDates, log } from '@/lib/reportUtils';
import { format, subDays } from 'date-fns';
import { authenticateRequest } from '@/lib/authMiddleware'; // Import the middleware

export async function GET(req: NextRequest) {
  // Step 1: Replace x-supabase-user with authenticateRequest
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log('REPORTS:WARDS:TREND', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as 'month' | 'year') || 'month';
  const compareTo = searchParams.get('compareTo') as 'last' | 'custom' | undefined;
  const customDate = searchParams.get('customDate') as string | undefined; // Step 2: Fix type to avoid 'string | null' error

  if (!['month', 'year'].includes(period)) {
    log('REPORTS:WARDS:TREND', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use month or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getPeriodDates(period, compareTo, customDate);
    log('REPORTS:WARDS:TREND', 'Fetching ward activity trends', {
      period,
      compareTo,
    });

    const buildTrendData = async (start: Date, end: Date) => {
      const sessions = await prisma.session.findMany({
        where: { timeIn: { gte: start, lte: end } },
        include: { admission: { include: { ward: true } } },
      });

      const byWardAndDate: Record<string, Record<string, number>> = {};
      sessions.forEach((session) => {
        const wardId = session.admission.ward.id;
        const date = format(
          session.timeIn,
          period === 'month' ? 'yyyy-MM-dd' : 'yyyy-MM',
        );
        if (!byWardAndDate[wardId]) byWardAndDate[wardId] = {};
        byWardAndDate[wardId][date] = (byWardAndDate[wardId][date] || 0) + 1;
      });

      const wards = await prisma.ward.findMany({
        where: { id: { in: Object.keys(byWardAndDate).map(Number) } },
        select: { id: true, name: true },
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

      return wards.map((ward) => ({
        wardId: ward.id,
        wardName: ward.name,
        trend: dates.map((date) => ({
          date,
          count: byWardAndDate[ward.id]?.[date] || 0,
        })),
      }));
    };

    const [currentData, previousData] = await Promise.all([
      buildTrendData(currentStart, currentEnd),
      buildTrendData(previousStart, previousEnd),
    ]);

    log('REPORTS:WARDS:TREND', 'Ward activity trends fetched', {
      wards: currentData.length,
    });
    return NextResponse.json({
      period,
      current: {
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
        data: currentData,
      },
      previous: {
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        data: previousData,
      },
    });
  } catch (error: unknown) { // Step 3: Type error as unknown
    log('REPORTS:WARDS:TREND', 'Failed to fetch ward activity trends', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch ward activity trends' },
      { status: 500 },
    );
  }
}

// Description: Tracks session counts per ward over time, showing busiest wards and trends.
// Notes:
// Data: Provides per-ward session trends for a Line Chart (one line per ward over time).
// Comparison: Includes current and previous period trends.
// Auth: Secured with x-supabase-user.
