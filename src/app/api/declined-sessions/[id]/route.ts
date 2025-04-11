// src/app/api/declined-sessions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:DECLINED-SESSIONS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest, 
  
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const dSId = parseInt(id, 10);
  if (isNaN(dSId)) {
    log('Invalid ID', { id: dSId });
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  try {
    const declinedSession = await prisma.declinedSession.findUnique({
      where: { id: dSId },
      include: { session: true, declineReason: true },
    });
    if (!declinedSession) {
      log('Declined session not found', { id });
      return NextResponse.json({ error: 'Declined session not found' }, { status: 404 });
    }
    log('Fetched declined session', { id });
    return NextResponse.json(declinedSession);
  } catch (error: unknown) {
    log('Failed to fetch declined session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch declined session' },
      { status: 500 },
    );
  }
}


export async function PUT(req: NextRequest, 
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const dSId = parseInt(id, 10);
  if (isNaN(dSId)) {
    log('Invalid ID', { id: dSId });
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
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

    const declinedSession = await prisma.declinedSession.update({
      where: { id: dSId },
      data: {
        declineReasonId,
        description: description && typeof description === 'string' ? description : null,
      },
    });
    log('Updated declined session', { id, declineReasonId });
    return NextResponse.json(declinedSession);
  } catch (error: unknown) {
    log('Failed to update declined session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update declined session' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, 
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  const authResult = await authenticateRequest(req, 4, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const dSId = parseInt(id, 10);
  if (isNaN(dSId)) {
    log('Invalid ID', { id: dSId });
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.declinedSession.delete({ where: { id: dSId } });
    log('Deleted declined session', { id });
    return NextResponse.json({ message: 'Declined session deleted' });
  } catch (error: unknown) {
    log('Failed to delete declined session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete declined session' },
      { status: 500 },
    );
  }
}