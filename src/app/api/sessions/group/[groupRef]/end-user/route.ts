
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus, SessionType } from '@prisma/client';
import { Prisma } from '@prisma/client';

type Params = { params: { groupRef: string } };

const log = (message: string, data?: any) =>
  console.log(`[API:SESSIONS/GROUP/END-USER] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function POST(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { groupRef } = params;

  if (!groupRef || typeof groupRef !== 'string') {
    log('Invalid groupRef', { groupRef });
    return NextResponse.json({ error: 'Invalid groupRef' }, { status: 400 });
  }

  let admissionId = 0;
  try {
    const body = await req.json();
    ({ admissionId } = body);
    log('Ending user session in group', { groupRef, admissionId });

    if (!admissionId || !Number.isInteger(admissionId)) {
      log('Missing or invalid admissionId', { admissionId });
      return NextResponse.json(
        { error: 'admissionId is required and must be a valid integer' },
        { status: 400 },
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        groupRef,
        type: SessionType.GROUP,
        admissionId,
        status: SessionStatus.SCHEDULED,
        timeOut: null,
      },
    });

    if (!session) {
      log('No active session found for this user in the group', { groupRef, admissionId });
      return NextResponse.json(
        { error: 'No active session found for this user in the group' },
        { status: 404 },
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.COMPLETED,
        timeOut: new Date(),
      },
      include: {
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    log('User session ended in group', { groupRef, admissionId });
    return NextResponse.json({
      ...updatedSession,
      timeIn: updatedSession.timeIn.toISOString(),
      timeOut: updatedSession.timeOut?.toISOString() || null,
      createdAt: updatedSession.createdAt.toISOString(),
      updatedAt: updatedSession.updatedAt?.toISOString() || null,
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      log('Session not found', { groupRef, admissionId });
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    log('Failed to end user session in group', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to end user session in group' }, { status: 500 });
  }
}
// src/app/api/sessions/group/[groupRef]/end-user/route.ts
