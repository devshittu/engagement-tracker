// src/app/api/activities/[id]/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/ACTIVATE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const creatorId = user.id;
  const { id } = params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    log('Invalid activity ID', { id });
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  try {
    log('Activating activity', { activityId });
    const logEntry = await prisma.activityContinuityLog.create({
      data: {
        activityId,
        startDate: new Date(),
        duration: 180, // Default 3 hours as per seed
        createdById: creatorId, // Assuming schema update
      },
      include: { activity: { include: { department: true } } },
    });

    log('Activity continuity log created successfully', { id: logEntry.id });
    return NextResponse.json(logEntry, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2003') {
      log('Activity not found', { activityId });
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
// src/app/api/activities/[id]/activate/route.ts
