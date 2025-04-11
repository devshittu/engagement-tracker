// src/app/api/reports/staff/engagement/summary/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';
// import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const startDateParam = searchParams.get('startDate');

//   let startDate: Date;
//   let endDate: Date;

//   try {
//     startDate = startDateParam
//       ? parseISO(startDateParam)
//       : startOfMonth(new Date());
//     endDate = endOfMonth(startDate);
//   } catch (error) {
//     log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Invalid date format', {
//       startDateParam,
//     });
//     return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
//   }

//   try {
//     log(
//       'REPORTS:STAFF:ENGAGEMENT:SUMMARY',
//       'Fetching staff engagement summary',
//       { startDate, endDate },
//     );

//     const staffSessions = await prisma.session.findMany({
//       where: {
//         timeIn: { gte: startDate, lte: endDate },
//         status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
//       },
//       include: {
//         staff: true, // Assuming a staff relation in the session model
//       },
//     });

//     const staffSummary = staffSessions.reduce(
//       (acc, session) => {
//         const email = session.staff?.email || 'Unknown';
//         if (!acc[email]) {
//           acc[email] = {
//             groups: { offered: 0, completed: 0, declined: 0 },
//             oneToOnes: { offered: 0, completed: 0, declined: 0 },
//           };
//         }
//         const category = session.type === 'GROUP' ? 'groups' : 'oneToOnes';
//         acc[email][category].offered += 1;
//         if (session.status === 'COMPLETED') acc[email][category].completed += 1;
//         if (session.status === 'CANCELLED') acc[email][category].declined += 1;
//         return acc;
//       },
//       {} as Record<
//         string,
//         {
//           groups: { offered: number; completed: number; declined: number };
//           oneToOnes: { offered: number; completed: number; declined: number };
//         }
//       >,
//     );

//     const staffArray = Object.entries(staffSummary).map(([email, data]) => ({
//       email,
//       groups: {
//         offered: data.groups.offered,
//         completed: data.groups.completed,
//         declined: data.groups.declined,
//         percentCompleted: data.groups.offered
//           ? (data.groups.completed / data.groups.offered) * 100
//           : 0,
//         percentDeclined: data.groups.offered
//           ? (data.groups.declined / data.groups.offered) * 100
//           : 0,
//       },
//       oneToOnes: {
//         offered: data.oneToOnes.offered,
//         completed: data.oneToOnes.completed,
//         declined: data.oneToOnes.declined,
//         percentCompleted: data.oneToOnes.offered
//           ? (data.oneToOnes.completed / data.oneToOnes.offered) * 100
//           : 0,
//         percentDeclined: data.oneToOnes.offered
//           ? (data.oneToOnes.declined / data.oneToOnes.offered) * 100
//           : 0,
//       },
//     }));

//     const totals = staffArray.reduce(
//       (acc, staff) => {
//         acc.groups.offered += staff.groups.offered;
//         acc.groups.completed += staff.groups.completed;
//         acc.groups.declined += staff.groups.declined;
//         acc.oneToOnes.offered += staff.oneToOnes.offered;
//         acc.oneToOnes.completed += staff.oneToOnes.completed;
//         acc.oneToOnes.declined += staff.oneToOnes.declined;
//         return acc;
//       },
//       {
//         groups: { offered: 0, completed: 0, declined: 0 },
//         oneToOnes: { offered: 0, completed: 0, declined: 0 },
//       },
//     );

//     const response = {
//       period: 'month',
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(),
//       staff: staffArray,
//       totals: {
//         groups: {
//           offered: totals.groups.offered,
//           completed: totals.groups.completed,
//           declined: totals.groups.declined,
//           percentCompleted: totals.groups.offered
//             ? (totals.groups.completed / totals.groups.offered) * 100
//             : 0,
//           percentDeclined: totals.groups.offered
//             ? (totals.groups.declined / totals.groups.offered) * 100
//             : 0,
//         },
//         oneToOnes: {
//           offered: totals.oneToOnes.offered,
//           completed: totals.oneToOnes.completed,
//           declined: totals.oneToOnes.declined,
//           percentCompleted: totals.oneToOnes.offered
//             ? (totals.oneToOnes.completed / totals.oneToOnes.offered) * 100
//             : 0,
//           percentDeclined: totals.oneToOnes.offered
//             ? (totals.oneToOnes.declined / totals.oneToOnes.offered) * 100
//             : 0,
//         },
//       },
//     };

//     log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Data prepared', {
//       staffCount: staffArray.length,
//       sample: staffArray.slice(0, 1),
//     });
//     return NextResponse.json(response);
//   } catch (error) {
//     log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Failed to fetch data', {
//       error: error.message,
//     });
//     return NextResponse.json(
//       { error: 'Failed to fetch staff engagement summary' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { authenticateRequest } from '@/lib/authMiddleware'; // Import the middleware

export async function GET(req: NextRequest) {
  // Step 1: Replace x-supabase-user with authenticateRequest
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get('startDate') as string | undefined; // Step 2: Fix type to avoid 'string | null' error

  let startDate: Date;
  let endDate: Date;

  try {
    startDate = startDateParam
      ? parseISO(startDateParam)
      : startOfMonth(new Date());
    endDate = endOfMonth(startDate);
  } catch (error: unknown) { // Step 3: Type error as unknown
    log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Invalid date format', {
      startDateParam,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  try {
    log(
      'REPORTS:STAFF:ENGAGEMENT:SUMMARY',
      'Fetching staff engagement summary',
      { startDate, endDate },
    );

    const staffSessions = await prisma.session.findMany({
      where: {
        timeIn: { gte: startDate, lte: endDate },
        status: { in: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
      },
      include: {
        facilitatedBy: true, // Renamed from 'staff' to match schema
      },
    });

    const staffSummary = staffSessions.reduce(
      (acc, session) => {
        const email = session.facilitatedBy?.email ?? 'Unknown'; // Step 4: Add fallback for null facilitatedBy
        if (!acc[email]) {
          acc[email] = {
            groups: { offered: 0, completed: 0, declined: 0 },
            oneToOnes: { offered: 0, completed: 0, declined: 0 },
          };
        }
        const category = session.type === 'GROUP' ? 'groups' : 'oneToOnes';
        acc[email][category].offered += 1;
        if (session.status === 'COMPLETED') acc[email][category].completed += 1;
        if (session.status === 'CANCELLED') acc[email][category].declined += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          groups: { offered: number; completed: number; declined: number };
          oneToOnes: { offered: number; completed: number; declined: number };
        }
      >,
    );

    const staffArray = Object.entries(staffSummary).map(([email, data]) => ({
      email,
      groups: {
        offered: data.groups.offered,
        completed: data.groups.completed,
        declined: data.groups.declined,
        percentCompleted: data.groups.offered
          ? (data.groups.completed / data.groups.offered) * 100
          : 0,
        percentDeclined: data.groups.offered
          ? (data.groups.declined / data.groups.offered) * 100
          : 0,
      },
      oneToOnes: {
        offered: data.oneToOnes.offered,
        completed: data.oneToOnes.completed,
        declined: data.oneToOnes.declined,
        percentCompleted: data.oneToOnes.offered
          ? (data.oneToOnes.completed / data.oneToOnes.offered) * 100
          : 0,
        percentDeclined: data.oneToOnes.offered
          ? (data.oneToOnes.declined / data.oneToOnes.offered) * 100
          : 0,
      },
    }));

    const totals = staffArray.reduce(
      (acc, staff) => {
        acc.groups.offered += staff.groups.offered;
        acc.groups.completed += staff.groups.completed;
        acc.groups.declined += staff.groups.declined;
        acc.oneToOnes.offered += staff.oneToOnes.offered;
        acc.oneToOnes.completed += staff.oneToOnes.completed;
        acc.oneToOnes.declined += staff.oneToOnes.declined;
        return acc;
      },
      {
        groups: { offered: 0, completed: 0, declined: 0 },
        oneToOnes: { offered: 0, completed: 0, declined: 0 },
      },
    );

    const response = {
      period: 'month',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      staff: staffArray,
      totals: {
        groups: {
          offered: totals.groups.offered,
          completed: totals.groups.completed,
          declined: totals.groups.declined,
          percentCompleted: totals.groups.offered
            ? (totals.groups.completed / totals.groups.offered) * 100
            : 0,
          percentDeclined: totals.groups.offered
            ? (totals.groups.declined / totals.groups.offered) * 100
            : 0,
        },
        oneToOnes: {
          offered: totals.oneToOnes.offered,
          completed: totals.oneToOnes.completed,
          declined: totals.oneToOnes.declined,
          percentCompleted: totals.oneToOnes.offered
            ? (totals.oneToOnes.completed / totals.oneToOnes.offered) * 100
            : 0,
          percentDeclined: totals.oneToOnes.offered
            ? (totals.oneToOnes.declined / totals.oneToOnes.offered) * 100
            : 0,
        },
      },
    };

    log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Data prepared', {
      staffCount: staffArray.length,
      sample: staffArray.slice(0, 1),
    });
    return NextResponse.json(response);
  } catch (error: unknown) { // Step 5: Type error as unknown
    log('REPORTS:STAFF:ENGAGEMENT:SUMMARY', 'Failed to fetch data', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch staff engagement summary' },
      { status: 500 },
    );
  }
}