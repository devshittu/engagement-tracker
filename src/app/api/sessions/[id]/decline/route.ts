// src/app/api/sessions/[id]/decline/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus } from '@prisma/client';

type Params = { params: Promise<{ id: string }> };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/ID/DECLINE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 1, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id: sessionIdStr } = await params;
  const sessionId: number = parseInt(sessionIdStr, 10);

  if (isNaN(sessionId)) {
    log('Invalid session ID', { id: sessionId });
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    const { declineReasonId, description } = await req.json();
    if (!declineReasonId || typeof declineReasonId !== 'number') {
      log('Invalid request data', { declineReasonId });
      return NextResponse.json(
        { error: 'Decline reason ID is required and must be a number' },
        { status: 400 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      log('Session not found', { id: sessionId });
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (
      session.status === SessionStatus.COMPLETED ||
      session.status === SessionStatus.DECLINED
    ) {
      log('Session already ended or declined', {
        id: sessionId,
        status: session.status,
      });
      return NextResponse.json(
        { error: 'Session is already completed or declined' },
        { status: 400 },
      );
    }

    const now = new Date();
    const updatedSession = await prisma.$transaction([
      prisma.session.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.DECLINED,
          timeOut: session.timeOut || now, // Set timeOut if not already set
        },
      }),
      prisma.declinedSession.create({
        data: {
          sessionId: sessionId,
          declineReasonId,
          description:
            description && typeof description === 'string' ? description : null,
        },
      }),
    ]);

    log('Session declined successfully', { id: sessionId, declineReasonId });
    return NextResponse.json({
      session: updatedSession[0],
      declinedSession: updatedSession[1],
    });
  } catch (error: unknown) {
    log('Failed to decline session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to decline session' },
      { status: 500 },
    );
  }
}
// src/app/api/sessions/[id]/decline/route.ts
