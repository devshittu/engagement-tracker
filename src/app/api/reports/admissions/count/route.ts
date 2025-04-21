// src/app/api/reports/admissions/count/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:ADMISSIONS:COUNT', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const period =
//     (searchParams.get('period') as 'week' | 'month' | 'year') || 'month';
//   const compareTo = searchParams.get('compareTo') as
//     | 'last'
//     | 'custom'
//     | undefined;
//   const customDate = searchParams.get('customDate');

//   if (!['week', 'month', 'year'].includes(period)) {
//     log('REPORTS:ADMISSIONS:COUNT', 'Invalid period', { period });
//     return NextResponse.json(
//       { error: 'Invalid period. Use week, month, or year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd, previousStart, previousEnd } =
//       getPeriodDates(period, compareTo, customDate);
//     log('REPORTS:ADMISSIONS:COUNT', 'Fetching admission counts', {
//       period,
//       compareTo,
//     });

//     const [currentAdmissions, previousAdmissions] = await Promise.all([
//       prisma.admission.groupBy({
//         by: ['wardId'],
//         _count: { id: true },
//         where: { admissionDate: { gte: currentStart, lte: currentEnd } },
//       }),
//       prisma.admission.groupBy({
//         by: ['wardId'],
//         _count: { id: true },
//         where: { admissionDate: { gte: previousStart, lte: previousEnd } },
//       }),
//     ]);

//     const wardIds = [
//       ...new Set([
//         ...currentAdmissions.map((a) => a.wardId),
//         ...previousAdmissions.map((a) => a.wardId),
//       ]),
//     ];
//     const wards = await prisma.ward.findMany({
//       where: { id: { in: wardIds } },
//       select: { id: true, name: true },
//     });

//     const buildData = (admissions: any[]) =>
//       wards.map((ward) => ({
//         wardId: ward.id,
//         wardName: ward.name,
//         count: admissions.find((a) => a.wardId === ward.id)?._count.id || 0,
//       }));

//     const currentData = buildData(currentAdmissions);
//     const previousData = buildData(previousAdmissions);

//     const trend = {
//       totalCurrent: currentData.reduce((sum, d) => sum + d.count, 0),
//       totalPrevious: previousData.reduce((sum, d) => sum + d.count, 0),
//       percentageChange:
//         previousData.reduce((sum, d) => sum + d.count, 0) > 0
//           ? ((currentData.reduce((sum, d) => sum + d.count, 0) -
//               previousData.reduce((sum, d) => sum + d.count, 0)) /
//               previousData.reduce((sum, d) => sum + d.count, 0)) *
//             100
//           : 0,
//     };

//     log('REPORTS:ADMISSIONS:COUNT', 'Admission counts fetched', {
//       totalCurrent: trend.totalCurrent,
//       totalPrevious: trend.totalPrevious,
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
//       trend,
//     });
//   } catch (error) {
//     log('REPORTS:ADMISSIONS:COUNT', 'Failed to fetch admission counts', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch admission counts' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { getPeriodDates, log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:ADMISSIONS:COUNT', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period =
    (searchParams.get('period') as 'week' | 'month' | 'year') || 'month';
  const compareTo = searchParams.get('compareTo') as
    | 'last'
    | 'custom'
    | undefined;
  const customDate = searchParams.get('customDate') as string | undefined; // Fixed: string | undefined instead of string | null

  if (!['week', 'month', 'year'].includes(period)) {
    log('REPORTS:ADMISSIONS:COUNT', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use week, month, or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getPeriodDates(period, compareTo, customDate);
    log('REPORTS:ADMISSIONS:COUNT', 'Fetching admission counts', {
      period,
      compareTo,
    });

    const [currentAdmissions, previousAdmissions] = await Promise.all([
      prisma.admission.groupBy({
        by: ['wardId'],
        _count: { id: true },
        where: { admissionDate: { gte: currentStart, lte: currentEnd } },
      }),
      prisma.admission.groupBy({
        by: ['wardId'],
        _count: { id: true },
        where: { admissionDate: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const wardIds = [
      ...new Set([
        ...currentAdmissions.map((a) => a.wardId),
        ...previousAdmissions.map((a) => a.wardId),
      ]),
    ];
    const wards = await prisma.ward.findMany({
      where: { id: { in: wardIds } },
      select: { id: true, name: true },
    });

    const buildData = (admissions: typeof currentAdmissions) =>
      wards.map((ward) => ({
        wardId: ward.id,
        wardName: ward.name,
        count: admissions.find((a) => a.wardId === ward.id)?._count.id || 0,
      }));

    const currentData = buildData(currentAdmissions);
    const previousData = buildData(previousAdmissions);

    const trend = {
      totalCurrent: currentData.reduce((sum, d) => sum + d.count, 0),
      totalPrevious: previousData.reduce((sum, d) => sum + d.count, 0),
      percentageChange:
        previousData.reduce((sum, d) => sum + d.count, 0) > 0
          ? ((currentData.reduce((sum, d) => sum + d.count, 0) -
              previousData.reduce((sum, d) => sum + d.count, 0)) /
              previousData.reduce((sum, d) => sum + d.count, 0)) *
            100
          : 0,
    };

    log('REPORTS:ADMISSIONS:COUNT', 'Admission counts fetched', {
      totalCurrent: trend.totalCurrent,
      totalPrevious: trend.totalPrevious,
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
      trend,
    });
  } catch (error: unknown) {
    log('REPORTS:ADMISSIONS:COUNT', 'Failed to fetch admission counts', error);
    return NextResponse.json(
      { error: 'Failed to fetch admission counts' },
      { status: 500 },
    );
  }
}

// Description: Counts new admissions in a period with comparison to a past period (e.g., last month vs. 5 months ago).
// Notes:
// Data: Provides ward-based admission counts for a Bar Chart (current vs. past periods).
// Comparison: Includes current and previous period data with percentage change.
// Auth: Secured with x-supabase-user.
