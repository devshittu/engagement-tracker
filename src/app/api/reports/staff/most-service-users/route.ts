// src/app/api/reports/staff/most-service-users/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getPeriodDates, log } from '@/lib/reportUtils';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:STAFF:MOST-SERVICE-USERS', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const period = (searchParams.get('period') as 'month' | 'year') || 'month';

//   if (!['month', 'year'].includes(period)) {
//     log('REPORTS:STAFF:MOST-SERVICE-USERS', 'Invalid period', { period });
//     return NextResponse.json(
//       { error: 'Invalid period. Use month or year.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const { currentStart, currentEnd } = getPeriodDates(period);
//     log(
//       'REPORTS:STAFF:MOST-SERVICE-USERS',
//       'Fetching staff with most service users',
//       { period },
//     );

//     const sessions = await prisma.session.findMany({
//       where: { timeIn: { gte: currentStart, lte: currentEnd } },
//       include: {
//         admission: true,
//         facilitatedBy: { select: { id: true, name: true } },
//       },
//     });

//     const staffMetrics: Record<
//       string,
//       { name: string; serviceUserIds: Set<number> }
//     > = {};
//     sessions.forEach((session) => {
//       const staffId = session.facilitatedById;
//       if (!staffMetrics[staffId]) {
//         staffMetrics[staffId] = {
//           name: session.facilitatedBy.name,
//           serviceUserIds: new Set(),
//         };
//       }
//       staffMetrics[staffId].serviceUserIds.add(session.admission.serviceUserId);
//     });

//     const data = Object.entries(staffMetrics)
//       .map(([staffId, { name, serviceUserIds }]) => ({
//         staffId,
//         staffName: name,
//         uniqueServiceUsers: serviceUserIds.size,
//       }))
//       .sort((a, b) => b.uniqueServiceUsers - a.uniqueServiceUsers);

//     const top = data[0] || null;

//     log(
//       'REPORTS:STAFF:MOST-SERVICE-USERS',
//       'Staff service user metrics fetched',
//       { topStaff: top?.staffName },
//     );
//     return NextResponse.json({
//       period,
//       startDate: currentStart.toISOString(),
//       endDate: currentEnd.toISOString(),
//       data,
//       top,
//     });
//   } catch (error) {
//     log(
//       'REPORTS:STAFF:MOST-SERVICE-USERS',
//       'Failed to fetch staff service user metrics',
//       error,
//     );
//     return NextResponse.json(
//       { error: 'Failed to fetch staff service user metrics' },
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
    (message, data) => log('REPORTS:STAFF:MOST-SERVICE-USERS', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as 'month' | 'year') || 'month';

  if (!['month', 'year'].includes(period)) {
    log('REPORTS:STAFF:MOST-SERVICE-USERS', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use month or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd } = getPeriodDates(period);
    log(
      'REPORTS:STAFF:MOST-SERVICE-USERS',
      'Fetching staff with most service users',
      { period },
    );

    const sessions = await prisma.session.findMany({
      where: { timeIn: { gte: currentStart, lte: currentEnd } },
      include: {
        admission: true,
        facilitatedBy: { select: { id: true, name: true } },
      },
    });

    const staffMetrics: Record<
      string,
      { name: string; serviceUserIds: Set<number> }
    > = {};
    sessions.forEach((session) => {
      const staffId = session.facilitatedById;
      if (!staffMetrics[staffId]) {
        staffMetrics[staffId] = {
          name: session.facilitatedBy?.name ?? 'Unknown', // Step 2: Add fallback for null name
          serviceUserIds: new Set(),
        };
      }
      staffMetrics[staffId].serviceUserIds.add(session.admission.serviceUserId);
    });

    const data = Object.entries(staffMetrics)
      .map(([staffId, { name, serviceUserIds }]) => ({
        staffId,
        staffName: name,
        uniqueServiceUsers: serviceUserIds.size,
      }))
      .sort((a, b) => b.uniqueServiceUsers - a.uniqueServiceUsers);

    const top = data[0] || null;

    log(
      'REPORTS:STAFF:MOST-SERVICE-USERS',
      'Staff service user metrics fetched',
      { topStaff: top?.staffName },
    );
    return NextResponse.json({
      period,
      startDate: currentStart.toISOString(),
      endDate: currentEnd.toISOString(),
      data,
      top,
    });
  } catch (error: unknown) {
    // Step 3: Type error as unknown
    log(
      'REPORTS:STAFF:MOST-SERVICE-USERS',
      'Failed to fetch staff service user metrics',
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return NextResponse.json(
      { error: 'Failed to fetch staff service user metrics' },
      { status: 500 },
    );
  }
}
// Description: Identifies staff with the highest number of unique service users engaged in sessions over a period.

// Notes:
// Data: Provides staff rankings for a Pie Chart (distribution) or Bar Chart (top N), focusing on unique service users.
// Top Performer: Highlights the staff with the most service users.
// Auth: Secured with x-supabase-user.
