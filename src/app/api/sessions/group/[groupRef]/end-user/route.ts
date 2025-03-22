import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SessionType, SessionStatus } from '@prisma/client';

type Params = { params: { groupRef: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/GROUP/END-USER] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { groupRef } = params;

  if (!groupRef || typeof groupRef !== 'string') {
    log('Invalid groupRef', { groupRef });
    return NextResponse.json({ error: 'Invalid groupRef' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { admissionId } = body;
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
      log('No active session found for this user in the group', {
        groupRef,
        admissionId,
      });
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
    return NextResponse.json(
      {
        ...updatedSession,
        timeIn: updatedSession.timeIn.toISOString(),
        timeOut: updatedSession.timeOut?.toISOString() || null,
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt?.toISOString() || null,
      },
      { status: 200 },
    );
  } catch (error: any) {
    log('Failed to end user session in group', error);
    return NextResponse.json(
      { error: 'Failed to end user session in group' },
      { status: 500 },
    );
  }
}
