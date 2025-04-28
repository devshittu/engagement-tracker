// src/app/api/activity-continuity-logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITY-CONTINUITY-LOGS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * pageSize;

  try {
    const userRoleLevel = userProfile.roles[0].level;
    const whereClause: any = {};
    if (userRoleLevel < 3) {
      whereClause.activity = {
        departmentId: userProfile.departmentId,
      };
    }

    log('Fetching continuity logs', { page, pageSize });
    const [logs, total] = await Promise.all([
      prisma.activityContinuityLog.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: {
          activity: { include: { department: true } },
          createdBy: true,
        },
      }),
      prisma.activityContinuityLog.count({ where: whereClause }),
    ]);

    const serialized = logs.map((log) => ({
      ...log,
      startDate: log.startDate.toISOString(),
      discontinuedDate: log.discontinuedDate?.toISOString() || null,
    }));

    log('Continuity logs fetched successfully', { count: logs.length });
    return NextResponse.json({ logs: serialized, total, page, pageSize });
  } catch (error: unknown) {
    log('Failed to fetch continuity logs', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch continuity logs' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile, userId } = authResult;

  let activityId: number | undefined = undefined;
  let startDate: string | undefined = undefined;
  let duration: number | undefined = undefined;

  try {
    const body = await req.json();
    activityId = body.activityId;
    startDate = body.startDate;
    duration = body.duration;

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

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      log('Activity not found', { activityId });
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 },
      );
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (
      userRoleLevel < 3 &&
      activity.departmentId !== userProfile.departmentId
    ) {
      log(
        'Forbidden: User does not have permission to create a log for this activity',
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logEntry = await prisma.activityContinuityLog.create({
      data: {
        activityId: activityId!,
        startDate: new Date(startDate),
        duration: duration!,
        createdById: userId,
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
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        log('Invalid activity ID', { activityId });
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to create continuity log', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create continuity log' },
      { status: 500 },
    );
  }
}
// src/app/api/activity-continuity-logs/route.ts
