// src/app/api/sessions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(`[API:SESSIONS/ID] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    log('Invalid session ID', { id });
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    log('Fetching session', { id: sessionId });
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        facilitatedBy: true,
        activityLog: { include: { activity: true } },
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    if (!session) {
      log('Session not found', { id: sessionId });
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    log('Session fetched successfully', { id: session.id });
    return NextResponse.json({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
      admission: {
        ...session.admission,
        admissionDate: session.admission.admissionDate.toISOString(),
        dischargeDate: session.admission.dischargeDate?.toISOString() || null,
      },
    });
  } catch (error: unknown) {
    log('Failed to fetch session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    log('Invalid session ID', { id });
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    const { status, timeOut, cancelReason, activityLogId } = await req.json();
    log('Updating session', { id: sessionId, status, timeOut, cancelReason, activityLogId });

    const updateData: any = {};
    if (status && [SessionStatus.SCHEDULED, SessionStatus.COMPLETED, SessionStatus.CANCELLED].includes(status)) {
      updateData.status = status;
    }
    if (timeOut !== undefined) updateData.timeOut = timeOut ? new Date(timeOut) : null;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason || null;
    if (activityLogId && Number.isInteger(activityLogId)) {
      const activityLog = await prisma.activityContinuityLog.findUnique({
        where: { id: activityLogId },
      });
      if (!activityLog) {
        log('Activity log not found', { activityLogId });
        return NextResponse.json({ error: 'Activity log not found' }, { status: 404 });
      }
      updateData.activityLogId = activityLogId;
    }

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        facilitatedBy: true,
        activityLog: { include: { activity: true } },
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    log('Session updated successfully', { id: session.id });
    return NextResponse.json({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
      admission: {
        ...session.admission,
        admissionDate: session.admission.admissionDate.toISOString(),
        dischargeDate: session.admission.dischargeDate?.toISOString() || null,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      log('Session not found', { id: sessionId });
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    log('Failed to update session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    log('Invalid session ID', { id });
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    log('Deleting session', { id: sessionId });
    await prisma.session.delete({
      where: { id: sessionId },
    });
    log('Session deleted successfully', { id: sessionId });
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      log('Session not found', { id: sessionId });
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    log('Failed to delete session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
// src/app/api/sessions/[id]/route.ts
