import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionType, SessionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

type Params = { params: Promise<{ groupRef: string }> };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/GROUP/JOIN] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const { groupRef } = await params;

  if (!groupRef || typeof groupRef !== 'string') {
    log('Invalid groupRef', { groupRef });
    return NextResponse.json({ error: 'Invalid groupRef' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { admissionId } = body;
    log('Joining group session', { groupRef, admissionId });

    if (!admissionId || !Number.isInteger(admissionId)) {
      log('Missing or invalid admissionId', { admissionId });
      return NextResponse.json(
        { error: 'admissionId is required and must be a valid integer' },
        { status: 400 },
      );
    }

    const existingSession = await prisma.session.findFirst({
      where: {
        groupRef,
        type: SessionType.GROUP,
        status: SessionStatus.SCHEDULED,
        timeOut: null,
      },
      include: {
        activityLog: { include: { activity: true } },
      },
    });

    if (!existingSession) {
      log('No active group session found', { groupRef });
      return NextResponse.json(
        { error: 'No active group session found with this groupRef' },
        { status: 404 },
      );
    }

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
    });
    if (!admission) {
      log('Admission not found', { admissionId });
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      );
    }

    const newSession = await prisma.session.create({
      data: {
        type: SessionType.GROUP,
        status: SessionStatus.SCHEDULED,
        facilitatedById: userId,
        activityLogId: existingSession.activityLogId,
        admissionId,
        groupRef,
        groupDescription: existingSession.groupDescription,
        timeIn: new Date(),
      },
      include: {
        facilitatedBy: true,
        activityLog: { include: { activity: true } },
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    log('User added to group session', { groupRef, admissionId });
    return NextResponse.json(
      {
        ...newSession,
        timeIn: newSession.timeIn.toISOString(),
        timeOut: newSession.timeOut?.toISOString() || null,
        createdAt: newSession.createdAt.toISOString(),
        updatedAt: newSession.updatedAt?.toISOString() || null,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      log('Invalid admission ID');
      return NextResponse.json(
        { error: 'Invalid admission ID' },
        { status: 404 },
      );
    }
    log('Failed to join group session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to join group session' },
      { status: 500 },
    );
  }
}

// src/app/api/sessions/group/[groupRef]/join/route.ts
