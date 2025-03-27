
// src/app/api/reports/sessions/most-participated/route.ts
// src/app/api/reports/sessions/most-participated/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { log } from '@/lib/reportUtils';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const yearStr = searchParams.get('year');
//   const monthStr = searchParams.get('month');
//   const now = new Date();
//   const year = yearStr ? parseInt(yearStr) : now.getFullYear();
//   const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1;

//   try {
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 0, 23, 59, 59);
//     log(
//       'REPORTS:SESSIONS:MOST-PARTICIPATED',
//       'Fetching most participated activities',
//       { year, month },
//     );

//     const grouped = await prisma.session.groupBy({
//       by: ['activityLogId'],
//       _count: { id: true },
//       where: { timeIn: { gte: startDate, lte: endDate } },
//       orderBy: { _count: { id: 'desc' } },
//     });

//     if (grouped.length === 0) {
//       return NextResponse.json({
//         period: { year, month },
//         data: [],
//         top: null,
//       });
//     }

//     const activityLogIds = grouped.map((g) => g.activityLogId);
//     const activityLogs = await prisma.activityContinuityLog.findMany({
//       where: { id: { in: activityLogIds } },
//       include: { activity: { select: { id: true, name: true } } },
//     });

//     const data = grouped.map((group) => {
//       const log = activityLogs.find((l) => l.id === group.activityLogId);
//       return {
//         activityLogId: group.activityLogId,
//         count: group._count.id,
//         activityName: log?.activity?.name || 'Unknown',
//       };
//     });

//     log(
//       'REPORTS:SESSIONS:MOST-PARTICIPATED',
//       'Most participated activities fetched',
//       { top: data[0] },
//     );
//     return NextResponse.json({ period: { year, month }, data, top: data[0] });
//   } catch (error) {
//     log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Failed to fetch report', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch report' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log('REPORTS:SESSIONS:MOST-PARTICIPATED', message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const yearStr = searchParams.get('year');
  const monthStr = searchParams.get('month');
  const now = new Date();
  const year = yearStr ? parseInt(yearStr) : now.getFullYear();
  const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Fetching most participated activities', {
      year,
      month,
    });

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

    log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Most participated activities fetched', {
      top: data[0],
    });
    return NextResponse.json({ period: { year, month }, data, top: data[0] });
  } catch (error: unknown) {
    log('REPORTS:SESSIONS:MOST-PARTICIPATED', 'Failed to fetch report', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/sessions/most-participated/route.ts
