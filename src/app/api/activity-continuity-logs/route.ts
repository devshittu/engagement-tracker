// src/app/api/activity-continuity-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITY_CONTINUITY_LOGS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    log('Fetching continuity logs', { page, pageSize });
    const [logs, total] = await Promise.all([
      prisma.activityContinuityLog.findMany({
        skip,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: {
          activity: { include: { department: true } },
          createdBy: true,
        },
      }),
      prisma.activityContinuityLog.count(),
    ]);

    const serialized = logs.map((log) => ({
      ...log,
      startDate: log.startDate.toISOString(),
      discontinuedDate: log.discontinuedDate?.toISOString() || null,
    }));

    log('Continuity logs fetched successfully', { count: logs.length });
    return NextResponse.json({ logs: serialized, total, page, pageSize });
  } catch (error) {
    log('Failed to fetch continuity logs', error);
    return NextResponse.json(
      { error: 'Failed to fetch continuity logs' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const creatorId = user.id;

  try {
    const { activityId, startDate, duration } = await req.json();
    log('Creating continuity log', { activityId, startDate, duration });

    if (
      !Number.isInteger(activityId) ||
      !startDate ||
      !Number.isInteger(duration)
    ) {
      log('Invalid input');
      return NextResponse.json(
        { error: 'Activity ID, start date, and duration are required' },
        { status: 400 },
      );
    }

    const logEntry = await prisma.activityContinuityLog.create({
      data: {
        activityId,
        startDate: new Date(startDate),
        duration,
        createdById: creatorId,
      },
      include: { activity: { include: { department: true } }, createdBy: true },
    });

    log('Continuity log created successfully', { id: logEntry.id });
    return NextResponse.json(
      {
        ...logEntry,
        startDate: logEntry.startDate.toISOString(),
        discontinuedDate: logEntry.discontinuedDate?.toISOString() || null,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 'P2003') {
      log('Invalid activity ID', { activityId });
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 },
      );
    }
    log('Failed to create continuity log', error);
    return NextResponse.json(
      { error: 'Failed to create continuity log' },
      { status: 500 },
    );
  }
}
// src/app/api/activity-continuity-logs/route.ts
