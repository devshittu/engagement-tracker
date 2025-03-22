// src/app/api/sessions/[id]/end/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SessionStatus } from '@prisma/client';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/END] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    log('Invalid session ID', { id });
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    log('Ending session', { id: sessionId });
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        timeOut: new Date(),
        status: SessionStatus.COMPLETED,
      },
      include: {
        facilitatedBy: true,
        activityLog: { include: { activity: true } },
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    log('Session ended successfully', { id: session.id });
    return NextResponse.json({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Session not found', { id: sessionId });
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    log('Failed to end session', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 },
    );
  }
}
// src/app/api/sessions/[id]/end/route.ts
