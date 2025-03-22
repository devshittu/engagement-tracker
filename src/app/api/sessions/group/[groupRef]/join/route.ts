import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SessionType, SessionStatus } from '@prisma/client';

type Params = { params: { groupRef: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/GROUP/JOIN] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const facilitatorId = user.id;
  const { groupRef } = params;

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
        facilitatedById: facilitatorId,
        activityLogId: existingSession.activityLogId,
        admissionId,
        groupRef,
        groupDescription: existingSession.groupDescription,
        timeIn: new Date(),
        // duration: existingSession.duration,
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
  } catch (error: any) {
    log('Failed to join group session', error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid admission ID' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to join group session' },
      { status: 500 },
    );
  }
}
