// src/app/api/sessions/backdated/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus, SessionType } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, logger.debug);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { type, admissionIds, activityLogId, timeIn, timeOut, groupRef, groupDescription } = body;

  // Validate input
  if (
    !type ||
    !timeIn ||
    !(type === 'ONE_TO_ONE' ? admissionIds?.length === 1 : admissionIds?.length > 0) ||
    (type === 'ONE_TO_ONE' && !activityLogId) ||
    (type === 'GROUP' && !groupRef)
  ) {
    logger.warn('Invalid input for backdated session', {
      type,
      admissionIds,
      activityLogId,
      groupRef,
    });
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    // Check for overlapping sessions
    const overlapCheck = await prisma.session.findFirst({
      where: {
        admissionId: type === 'ONE_TO_ONE' ? admissionIds[0] : { in: admissionIds },
        status: { not: SessionStatus.COMPLETED },
        OR: [
          { timeIn: { lte: new Date(timeIn), gte: new Date(timeOut || timeIn) } },
          { timeOut: { not: null, gte: new Date(timeIn), lte: new Date(timeOut || timeIn) } },
          { timeIn: { lte: new Date(timeIn) }, timeOut: { gte: new Date(timeOut || timeIn) } },
        ],
      },
    });

    if (overlapCheck) {
      logger.warn('Overlapping session detected', { admissionId: admissionIds, timeIn, timeOut });
      return NextResponse.json({ error: 'Session overlaps with an existing session' }, { status: 400 });
    }

    // Create session(s)
    const baseSessionData = {
      type: type as SessionType,
      timeIn: new Date(timeIn),
      timeOut: timeOut ? new Date(timeOut) : null,
      status: SessionStatus.COMPLETED,
      facilitatedBy: { connect: { id: userId } }, // Connect authenticated user
    };

    let sessions;
    if (type === 'ONE_TO_ONE') {
      sessions = await prisma.session.create({
        data: {
          ...baseSessionData,
          admission: { connect: { id: admissionIds[0] } },
          activityLog: { connect: { id: activityLogId } },
        },
      });
    } else {
      sessions = await Promise.all(
        admissionIds.map((admissionId: number) =>
          prisma.session.create({
            data: {
              ...baseSessionData,
              admission: { connect: { id: admissionId } },
              activityLog: { connect: { id: activityLogId } },
              groupRef: groupRef,
              groupDescription: groupDescription || undefined, // Optional field
            },
          }),
        ),
      );
    }

    logger.info('Backdated session(s) created successfully', {
      count: Array.isArray(sessions) ? sessions.length : 1,
    });
    return NextResponse.json(sessions, { status: 201 });
  } catch (error: unknown) {
    logger.error('Failed to create backdated session(s)', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to create backdated session(s)' }, { status: 500 });
  }
}

// src/app/api/sessions/backdated/route.ts
