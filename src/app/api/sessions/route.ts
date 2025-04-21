// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * pageSize;

  try {
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        skip,
        take: pageSize,
        orderBy: { timeIn: 'desc' },
        include: {
          facilitatedBy: true,
          admission: { include: { serviceUser: true } },
          activityLog: { include: { activity: true } }, // Include activityLog and activity
        },
      }),
      prisma.session.count(),
    ]);

    const serialized = sessions.map((session) => ({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
      activityLog: {
        ...session.activityLog,
        startDate: session.activityLog.startDate.toISOString(),
        discontinuedDate:
          session.activityLog.discontinuedDate?.toISOString() || null,
      },
    }));

    log('Sessions fetched successfully', { count: sessions.length, total });
    return NextResponse.json(
      { sessions: serialized, total, page, pageSize },
      { status: 200 },
    );
  } catch (error: unknown) {
    log('Failed to fetch sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { type, admissionId, activityLogId, groupRef } = body;

  if (
    !type ||
    (type === 'ONE_TO_ONE' && (!admissionId || !activityLogId)) ||
    (type === 'GROUP' && !groupRef)
  ) {
    log('Invalid input', { type, admissionId, activityLogId, groupRef });
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const sessionData = {
      type,
      facilitatedById: userId,
      timeIn: new Date(),
      timeOut: null,
      admissionId: type === 'ONE_TO_ONE' ? admissionId : undefined,
      activityLogId: type === 'ONE_TO_ONE' ? activityLogId : undefined,
      groupRef: type === 'GROUP' ? groupRef : undefined,
    };

    const session = await prisma.session.create({
      data: sessionData,
      include: {
        facilitatedBy: true,
        admission: { include: { serviceUser: true } },
        activityLog: { include: { activity: true } },
      },
    });

    log('Session created successfully', { id: session.id });
    return NextResponse.json(
      {
        ...session,
        timeIn: session.timeIn.toISOString(),
        timeOut: session.timeOut?.toISOString() || null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt?.toISOString() || null,
        activityLog: {
          ...session.activityLog,
          startDate: session.activityLog.startDate.toISOString(),
          discontinuedDate:
            session.activityLog.discontinuedDate?.toISOString() || null,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    log('Failed to create session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}

// src/app/api/sessions/route.ts
