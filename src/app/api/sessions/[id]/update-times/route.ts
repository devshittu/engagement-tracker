// src/app/api/sessions/[id]/update-times/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateRequest(req, 0, undefined, logger.debug);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const { timeIn, timeOut } = await req.json();

  if (!id || !timeIn || !timeOut) {
    logger.warn('Invalid input for session time update', {
      id,
      timeIn,
      timeOut,
    });
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(id) },
    });
    if (!session || session.status !== SessionStatus.COMPLETED) {
      logger.warn('Session not found or not concluded', {
        id,
        status: session?.status,
      });
      return NextResponse.json(
        { error: 'Session not found or not concluded' },
        { status: 404 },
      );
    }

    // Check for overlapping sessions
    const overlapCheck = await prisma.session.findFirst({
      where: {
        admissionId: session.admissionId,
        id: { not: parseInt(id) },
        status: { not: SessionStatus.COMPLETED },
        OR: [
          { timeIn: { lte: new Date(timeIn), gte: new Date(timeOut) } },
          {
            timeOut: {
              not: null,
              gte: new Date(timeIn),
              lte: new Date(timeOut),
            },
          },
          {
            timeIn: { lte: new Date(timeIn) },
            timeOut: { gte: new Date(timeOut) },
          },
        ],
      },
    });

    if (overlapCheck) {
      logger.warn('Overlapping session detected during update', {
        admissionId: session.admissionId,
        timeIn,
        timeOut,
      });
      return NextResponse.json(
        { error: 'Session overlaps with an existing session' },
        { status: 400 },
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: parseInt(id) },
      data: { timeIn: new Date(timeIn), timeOut: new Date(timeOut) },
    });

    logger.info('Session times updated successfully', { id });
    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error: unknown) {
    logger.error('Failed to update session times', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update session times' },
      { status: 500 },
    );
  }
}
// src/app/api/sessions/[id]/update-times/route.ts
