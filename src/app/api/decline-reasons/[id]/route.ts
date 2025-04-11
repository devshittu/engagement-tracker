// src/app/api/decline-reasons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:DECLINE-REASONS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest, 
  
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const dRId = parseInt(id, 10);
  if (isNaN(dRId)) {
    log('Invalid ID', { id: dRId });
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const reason = await prisma.declineReason.findUnique({ where: { id:dRId } });
    if (!reason) {
      log('Decline reason not found', { id });
      return NextResponse.json({ error: 'Decline reason not found' }, { status: 404 });
    }
    log('Fetched decline reason', { id });
    return NextResponse.json(reason);
  } catch (error: unknown) {
    log('Failed to fetch decline reason', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch decline reason' },
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

  const dRId = parseInt(id, 10);
  if (isNaN(dRId)) {
    log('Invalid ID', { id: dRId });
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      log('Invalid request data', { name });
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 },
      );
    }

    const reason = await prisma.declineReason.update({
      where: { id: dRId },
      data: { name },
    });
    log('Updated decline reason', { id, name });
    return NextResponse.json(reason);
  } catch (error: unknown) {
    log('Failed to update decline reason', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update decline reason' },
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

  
  const dRId = parseInt(id, 10);
  if (isNaN(dRId)) {
    log('Invalid ID', { id: dRId });
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }


  try {
    await prisma.declineReason.delete({ where: { id: dRId } });
    log('Deleted decline reason', { id });
    return NextResponse.json({ message: 'Decline reason deleted' });
  } catch (error: unknown) {
    log('Failed to delete decline reason', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete decline reason' },
      { status: 500 },
    );
  }
}