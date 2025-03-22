// src/app/api/activities/active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/ACTIVE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const activeActivityLogs = await prisma.activityContinuityLog.findMany({
      where: {
        startDate: { lte: now }, // Activity has started
        discontinuedDate: null, // Not discontinued
      },
      include: {
        activity: true,
      },
    });

    const serialized = activeActivityLogs.map((log) => ({
      id: log.id, // Use activityLogId instead of activityId for consistency with session creation
      name: log.activity.name,
      startDate: log.startDate.toISOString(),
    }));

    log('Fetched active activity logs', { count: serialized.length });
    return NextResponse.json(serialized);
  } catch (error) {
    log('Failed to fetch active activity logs', error);
    return NextResponse.json(
      { error: 'Failed to fetch active activity logs' },
      { status: 500 },
    );
  }
}
// src/app/api/activities/active/route.ts
