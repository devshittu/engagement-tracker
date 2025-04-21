// src/app/api/reports/trends/staff-monthly/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';
// import { startOfYear, endOfYear, format } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:TRENDS:STAFF-MONTHLY', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get('userId');
//   const yearStr = searchParams.get('year');

//   if (!userId) {
//     log('REPORTS:TRENDS:STAFF-MONTHLY', 'Missing userId', { userId });
//     return NextResponse.json({ error: 'userId is required' }, { status: 400 });
//   }

//   const now = new Date();
//   const year = yearStr ? parseInt(yearStr) : now.getFullYear();
//   if (isNaN(year)) {
//     log('REPORTS:TRENDS:STAFF-MONTHLY', 'Invalid year', { yearStr });
//     return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
//   }

//   try {
//     const currentStart = startOfYear(new Date(year, 0, 1));
//     const currentEnd = endOfYear(new Date(year, 0, 1));
//     const previousStart = startOfYear(new Date(year - 1, 0, 1));
//     const previousEnd = endOfYear(new Date(year - 1, 0, 1));

//     log('REPORTS:TRENDS:STAFF-MONTHLY', 'Fetching staff monthly trends', {
//       userId,
//       year,
//     });

//     const [currentSessions, previousSessions, staff] = await Promise.all([
//       prisma.session.findMany({
//         where: {
//           facilitatedById: userId,
//           timeIn: { gte: currentStart, lte: currentEnd },
//         },
//       }),
//       prisma.session.findMany({
//         where: {
//           facilitatedById: userId,
//           timeIn: { gte: previousStart, lte: previousEnd },
//         },
//       }),
//       prisma.user.findUnique({
//         where: { id: userId },
//         select: { id: true, name: true },
//       }),
//     ]);

//     if (!staff) {
//       log('REPORTS:TRENDS:STAFF-MONTHLY', 'Staff not found', { userId });
//       return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
//     }

//     const buildMonthlyData = (sessions: any[], startYear: number) => {
//       const byMonth: Record<string, number> = {};
//       sessions.forEach((session) => {
//         const month = format(session.timeIn, 'yyyy-MM');
//         byMonth[month] = (byMonth[month] || 0) + 1;
//       });

//       return Array.from({ length: 12 }, (_, i) => {
//         const month = format(new Date(startYear, i), 'yyyy-MM');
//         return { month, count: byMonth[month] || 0 };
//       });
//     };

//     const currentData = buildMonthlyData(currentSessions, year);
//     const previousData = buildMonthlyData(previousSessions, year - 1);

//     log('REPORTS:TRENDS:STAFF-MONTHLY', 'Staff monthly trends fetched', {
//       staffName: staff.name,
//     });
//     return NextResponse.json({
//       staff: { id: userId, name: staff.name },
//       current: {
//         year,
//         startDate: currentStart.toISOString(),
//         endDate: currentEnd.toISOString(),
//         data: currentData,
//       },
//       previous: {
//         year: year - 1,
//         startDate: previousStart.toISOString(),
//         endDate: previousEnd.toISOString(),
//         data: previousData,
//       },
//     });
//   } catch (error) {
//     log(
//       'REPORTS:TRENDS:STAFF-MONTHLY',
//       'Failed to fetch staff monthly trends',
//       error,
//     );
//     return NextResponse.json(
//       { error: 'Failed to fetch staff monthly trends' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';
import { startOfYear, endOfYear, format } from 'date-fns';
import { authenticateRequest } from '@/lib/authMiddleware'; // Import the middleware

export async function GET(req: NextRequest) {
  // Step 1: Replace x-supabase-user with authenticateRequest
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:TRENDS:STAFF-MONTHLY', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const yearStr = searchParams.get('year');

  if (!userId) {
    log('REPORTS:TRENDS:STAFF-MONTHLY', 'Missing userId', { userId });
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const now = new Date();
  const year = yearStr ? parseInt(yearStr) : now.getFullYear();
  if (isNaN(year)) {
    log('REPORTS:TRENDS:STAFF-MONTHLY', 'Invalid year', { yearStr });
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
  }

  try {
    const currentStart = startOfYear(new Date(year, 0, 1));
    const currentEnd = endOfYear(new Date(year, 0, 1));
    const previousStart = startOfYear(new Date(year - 1, 0, 1));
    const previousEnd = endOfYear(new Date(year - 1, 0, 1));

    log('REPORTS:TRENDS:STAFF-MONTHLY', 'Fetching staff monthly trends', {
      userId,
      year,
    });

    const [currentSessions, previousSessions, staff] = await Promise.all([
      prisma.session.findMany({
        where: {
          facilitatedById: userId,
          timeIn: { gte: currentStart, lte: currentEnd },
        },
      }),
      prisma.session.findMany({
        where: {
          facilitatedById: userId,
          timeIn: { gte: previousStart, lte: previousEnd },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      }),
    ]);

    if (!staff) {
      log('REPORTS:TRENDS:STAFF-MONTHLY', 'Staff not found', { userId });
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const buildMonthlyData = (sessions: any[], startYear: number) => {
      const byMonth: Record<string, number> = {};
      sessions.forEach((session) => {
        const month = format(session.timeIn, 'yyyy-MM');
        byMonth[month] = (byMonth[month] || 0) + 1;
      });

      return Array.from({ length: 12 }, (_, i) => {
        const month = format(new Date(startYear, i), 'yyyy-MM');
        return { month, count: byMonth[month] || 0 };
      });
    };

    const currentData = buildMonthlyData(currentSessions, year);
    const previousData = buildMonthlyData(previousSessions, year - 1);

    log('REPORTS:TRENDS:STAFF-MONTHLY', 'Staff monthly trends fetched', {
      staffName: staff.name ?? 'Unknown', // Step 2: Add fallback for null name
    });
    return NextResponse.json({
      staff: { id: userId, name: staff.name ?? 'Unknown' }, // Step 2: Add fallback for null name
      current: {
        year,
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
        data: currentData,
      },
      previous: {
        year: year - 1,
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        data: previousData,
      },
    });
  } catch (error: unknown) {
    // Step 3: Type error as unknown
    log(
      'REPORTS:TRENDS:STAFF-MONTHLY',
      'Failed to fetch staff monthly trends',
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return NextResponse.json(
      { error: 'Failed to fetch staff monthly trends' },
      { status: 500 },
    );
  }
}
// Description: Tracks a staff member’s session facilitation monthly over a year, with past year comparison.
// Notes:

// Data: Provides monthly counts for a Line Chart (current vs. past year for a staff member).
// Comparison: Always compares to the previous year.
// Auth: Secured with x-supabase-user.
