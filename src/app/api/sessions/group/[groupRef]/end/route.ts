// src/app/api/sessions/group/[groupRef]/end/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus, SessionType } from '@prisma/client';
import { Prisma } from '@prisma/client';

type Params = { params: { groupRef: string } };

const log = (message: string, data?: any) =>
  console.log(`[API:SESSIONS/GROUP/END] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function POST(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { groupRef } = params;

  if (!groupRef || typeof groupRef !== 'string') {
    log('Invalid groupRef', { groupRef });
    return NextResponse.json({ error: 'Invalid groupRef' }, { status: 400 });
  }

  try {
    log('Ending group session', { groupRef });

    const activeSessions = await prisma.session.findMany({
      where: {
        groupRef,
        type: SessionType.GROUP,
        timeOut: null,
      },
    });

    if (activeSessions.length === 0) {
      log('No active sessions found for group', { groupRef });
      return NextResponse.json(
        { error: 'No active sessions found for this group' },
        { status: 404 },
      );
    }

    const updatedSessions = await prisma.$transaction(
      activeSessions.map((session) =>
        prisma.session.update({
          where: { id: session.id },
          data: {
            timeOut: new Date(),
            status: SessionStatus.COMPLETED,
          },
          include: {
            facilitatedBy: true,
            activityLog: { include: { activity: true } },
            admission: { include: { serviceUser: true, ward: true } },
          },
        }),
      ),
    );

    log('Group session ended successfully', { groupRef, count: updatedSessions.length });
    return NextResponse.json(
      updatedSessions.map((session) => ({
        ...session,
        timeIn: session.timeIn.toISOString(),
        timeOut: session.timeOut?.toISOString() || null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt?.toISOString() || null,
      })),
    );
  } catch (error: unknown) {
    log('Failed to end group session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to end group session' }, { status: 500 });
  }
}
// src/app/api/sessions/group/[groupRef]/end/route.ts
