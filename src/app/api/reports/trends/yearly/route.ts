// src/app/api/reports/trends/yearly/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';
// import { startOfYear, endOfYear } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:TRENDS:YEARLY', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const year1Str = searchParams.get('year1');
//   const year2Str = searchParams.get('year2');
//   const now = new Date();
//   const year1 = year1Str ? parseInt(year1Str) : now.getFullYear();
//   const year2 = year2Str ? parseInt(year2Str) : year1 - 1;

//   if (isNaN(year1) || isNaN(year2)) {
//     log('REPORTS:TRENDS:YEARLY', 'Invalid year parameters', { year1, year2 });
//     return NextResponse.json(
//       { error: 'Invalid year parameters' },
//       { status: 400 },
//     );
//   }

//   try {
//     const year1Start = startOfYear(new Date(year1, 0, 1));
//     const year1End = endOfYear(new Date(year1, 0, 1));
//     const year2Start = startOfYear(new Date(year2, 0, 1));
//     const year2End = endOfYear(new Date(year2, 0, 1));

//     log('REPORTS:TRENDS:YEARLY', 'Fetching yearly comparison', {
//       year1,
//       year2,
//     });

//     const [year1Data, year2Data] = await Promise.all([
//       Promise.all([
//         prisma.session.count({
//           where: { timeIn: { gte: year1Start, lte: year1End } },
//         }),
//         prisma.admission.count({
//           where: { admissionDate: { gte: year1Start, lte: year1End } },
//         }),
//         prisma.session
//           .aggregate({
//             _count: { id: true },
//             where: { timeIn: { gte: year1Start, lte: year1End } },
//             _distinct: ['admissionId'],
//           })
//           .then((res) => res._count.id), // Unique service users engaged
//   å    ]),
//       Promise.all([
//         prisma.session.count({
//           where: { timeIn: { gte: year2Start, lte: year2End } },
//         }),
//         prisma.admission.count({
//           where: { admissionDate: { gte: year2Start, lte: year2End } },
//         }),
//         prisma.session
//           .aggregate({
//             _count: { id: true },
//             where: { timeIn: { gte: year2Start, lte: year2End } },
//             _distinct: ['admissionId'],
//           })
//           .then((res) => res._count.id),
//       ]),
//     ]);

//     const metrics = {
//       year1: {
//         year: year1,
//         startDate: year1Start.toISOString(),
//         endDate: year1End.toISOString(),
//         sessions: year1Data[0],
//         admissions: year1Data[1],
//         uniqueServiceUsers: year1Data[2],
//       },
//       year2: {
//         year: year2,
//         startDate: year2Start.toISOString(),
//         endDate: year2End.toISOString(),
//         sessions: year2Data[0],
//         admissions: year2Data[1],
//         uniqueServiceUsers: year2Data[2],
//       },
//       trends: {
//         sessionsChange:
//           year2Data[0] > 0
//             ? ((year1Data[0] - year2Data[0]) / year2Data[0]) * 100
//             : 0,
//         admissionsChange:
//           year2Data[1] > 0
//             ? ((year1Data[1] - year2Data[1]) / year2Data[1]) * 100
//             : 0,
//         uniqueServiceUsersChange:
//           year2Data[2] > 0
//             ? ((year1Data[2] - year2Data[2]) / year2Data[2]) * 100
//             : 0,
//       },
//     };

//     log('REPORTS:TRENDS:YEARLY', 'Yearly comparison fetched', {
//       year1Sessions: metrics.year1.sessions,
//       year2Sessions: metrics.year2.sessions,
//     });
//     return NextResponse.json(metrics);
//   } catch (error) {
//     log('REPORTS:TRENDS:YEARLY', 'Failed to fetch yearly comparison', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch yearly comparison' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';
import { startOfYear, endOfYear } from 'date-fns';
import { authenticateRequest } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(
    req,
    0,
    undefined,
    (message, data) => log('REPORTS:TRENDS:YEARLY', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const year1Str = searchParams.get('year1');
  const year2Str = searchParams.get('year2');
  const now = new Date();
  const year1 = year1Str ? parseInt(year1Str) : now.getFullYear();
  const year2 = year2Str ? parseInt(year2Str) : year1 - 1;

  if (isNaN(year1) || isNaN(year2)) {
    log('REPORTS:TRENDS:YEARLY', 'Invalid year parameters', { year1, year2 });
    return NextResponse.json(
      { error: 'Invalid year parameters' },
      { status: 400 },
    );
  }

  try {
    const year1Start = startOfYear(new Date(year1, 0, 1));
    const year1End = endOfYear(new Date(year1, 0, 1));
    const year2Start = startOfYear(new Date(year2, 0, 1));
    const year2End = endOfYear(new Date(year2, 0, 1));

    log('REPORTS:TRENDS:YEARLY', 'Fetching yearly comparison', {
      year1,
      year2,
    });

    const [year1Data, year2Data] = await Promise.all([
      Promise.all([
        prisma.session.count({
          where: { timeIn: { gte: year1Start, lte: year1End } },
        }),
        prisma.admission.count({
          where: { admissionDate: { gte: year1Start, lte: year1End } },
        }),
        prisma.session
          .groupBy({
            by: ['admissionId'],
            where: { timeIn: { gte: year1Start, lte: year1End } },
          })
          .then((res) => res.length), // Count unique admissionIds
      ]),
      Promise.all([
        prisma.session.count({
          where: { timeIn: { gte: year2Start, lte: year2End } },
        }),
        prisma.admission.count({
          where: { admissionDate: { gte: year2Start, lte: year2End } },
        }),
        prisma.session
          .groupBy({
            by: ['admissionId'],
            where: { timeIn: { gte: year2Start, lte: year2End } },
          })
          .then((res) => res.length),
      ]),
    ]);

    const metrics = {
      year1: {
        year: year1,
        startDate: year1Start.toISOString(),
        endDate: year1End.toISOString(),
        sessions: year1Data[0],
        admissions: year1Data[1],
        uniqueServiceUsers: year1Data[2],
      },
      year2: {
        year: year2,
        startDate: year2Start.toISOString(),
        endDate: year2End.toISOString(),
        sessions: year2Data[0],
        admissions: year2Data[1],
        uniqueServiceUsers: year2Data[2],
      },
      trends: {
        sessionsChange:
          year2Data[0] > 0
            ? ((year1Data[0] - year2Data[0]) / year2Data[0]) * 100
            : 0,
        admissionsChange:
          year2Data[1] > 0
            ? ((year1Data[1] - year2Data[1]) / year2Data[1]) * 100
            : 0,
        uniqueServiceUsersChange:
          year2Data[2] > 0
            ? ((year1Data[2] - year2Data[2]) / year2Data[2]) * 100
            : 0,
      },
    };

    log('REPORTS:TRENDS:YEARLY', 'Yearly comparison fetched', {
      year1Sessions: metrics.year1.sessions,
      year2Sessions: metrics.year2.sessions,
    });
    return NextResponse.json(metrics);
  } catch (error: unknown) {
    log('REPORTS:TRENDS:YEARLY', 'Failed to fetch yearly comparison', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch yearly comparison' },
      { status: 500 },
    );
  }
}

// Description: Compares session counts, admissions, and service user engagement year-over-year (e.g., 2025 vs. 2024).
// Notes:

// Data: Provides year-over-year metrics for a Bar Chart (sessions, admissions, service users side-by-side per year).
// Flexibility: Defaults to current year vs. previous year if params are omitted.
// Auth: Secured with x-supabase-user.
