// src/app/api/sessions/auto-end/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, logger.debug);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date();
    const ongoingSessions = await prisma.session.findMany({
      where: {
        status: SessionStatus.ONGOING,
        timeOut: null,
        timeIn: { lt: now },
      },
    });

    if (ongoingSessions.length === 0) {
      logger.debug('No ongoing sessions to auto-end', { timestamp: now });
      return NextResponse.json(
        { message: 'No sessions to auto-end' },
        { status: 200 },
      );
    }

    const sessionIds = ongoingSessions.map((session) => session.id);
    await prisma.session.updateMany({
      where: { id: { in: sessionIds } },
      data: { timeOut: now, status: SessionStatus.COMPLETED },
    });

    logger.debug('Auto-ended sessions successfully', {
      count: sessionIds.length,
      sessionIds,
    });
    return NextResponse.json(
      { message: 'Sessions auto-ended', count: sessionIds.length },
      { status: 200 },
    );
  } catch (error: unknown) {
    logger.error('Failed to auto-end sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to auto-end sessions' },
      { status: 500 },
    );
  }
}
// src/app/api/sessions/auto-end/route.ts
