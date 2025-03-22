// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { startOfMonth, addMonths } from 'date-fns';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const yearStr = searchParams.get('year');
//     const monthStr = searchParams.get('month');

//     const now = new Date();
//     const year = yearStr ? parseInt(yearStr) : now.getFullYear();
//     const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1;

//     const startDate = startOfMonth(new Date(year, month - 1));
//     const endDate = addMonths(startDate, 1);

//     // Group sessions by activityId within the period
//     const grouped = await prisma.session.groupBy({
//       by: ['activityId'],
//       _count: { id: true },
//       where: {
//         timeIn: {
//           gte: startDate,
//           lt: endDate,
//         },
//       },
//       orderBy: {
//         _count: { id: 'desc' },
//       },
//     });

//     // If no sessions found, return an empty result
//     if (grouped.length === 0) {
//       return NextResponse.json({
//         period: { year, month },
//         data: [],
//         top: null,
//       });
//     }

//     // Get activity IDs from the group
//     const activityIds = grouped.map((group) => group.activityId);

//     // Fetch details for these activities
//     const activities = await prisma.activity.findMany({
//       where: { id: { in: activityIds } },
//       select: { id: true, name: true },
//     });

//     // Merge the group results with activity names
//     const data = grouped.map((group) => {
//       const activity = activities.find((a) => a.id === group.activityId);
//       return {
//         activityId: group.activityId,
//         count: group._count.id,
//         activityName: activity ? activity.name : 'Unknown',
//       };
//     });

//     // The top activity is the first entry (highest count)
//     const top = data[0];

//     return NextResponse.json({
//       period: { year, month },
//       data,
//       top,
//     });
//   } catch (error) {
//     console.error(
//       'Failed to generate most participated session report:',
//       error,
//     );
//     return NextResponse.json(
//       { error: 'Failed to generate report' },
//       { status: 500 },
//     );
//   }
// }

// src/app/api/reports/sessions/most-participated/route.ts
// src/app/api/reports/sessions/most-participated/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yearStr = searchParams.get('year');
  const monthStr = searchParams.get('month');
  const now = new Date();
  const year = yearStr ? parseInt(yearStr) : now.getFullYear();
  const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    log(
      'REPORTS:SESSIONS:MOST-PARTICIPATED',
      'Fetching most participated activities',
      { year, month },
    );

    const grouped = await prisma.session.groupBy({
      by: ['activityLogId'],
      _count: { id: true },
      where: { timeIn: { gte: startDate, lte: endDate } },
      orderBy: { _count: { id: 'desc' } },
    });

    if (grouped.length === 0) {
      return NextResponse.json({
        period: { year, month },
        data: [],
        top: null,
      });
    }

    const activityLogIds = grouped.map((g) => g.activityLogId);
    const activityLogs = await prisma.activityContinuityLog.findMany({
      where: { id: { in: activityLogIds } },
      include: { activity: { select: { id: true, name: true } } },
    });

    const data = grouped.map((group) => {
      const log = activityLogs.find((l) => l.id === group.activityLogId);
      return {
        activityLogId: group.activityLogId,
        count: group._count.id,
        activityName: log?.activity?.name || 'Unknown',
      };
    });

    log(
      'REPORTS:SESSIONS:MOST-PARTICIPATED',
      'Most participated activities fetched',
      { top: data[0] },
    );
    return NextResponse.json({ period: { year, month }, data, top: data[0] });
  } catch (error) {
    log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Failed to fetch report', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/sessions/most-participated/route.ts
