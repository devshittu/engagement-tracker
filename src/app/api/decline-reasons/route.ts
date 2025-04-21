// src/app/api/decline-reasons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:DECLINE-REASONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const reasons = await prisma.declineReason.findMany({
      orderBy: { name: 'asc' },
    });
    log('Fetched decline reasons', { count: reasons.length });
    return NextResponse.json(reasons);
  } catch (error: unknown) {
    log('Failed to fetch decline reasons', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch decline reasons' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      log('Invalid request data', { name });
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 },
      );
    }

    const reason = await prisma.declineReason.create({
      data: { name },
    });
    log('Created decline reason', { id: reason.id, name });
    return NextResponse.json(reason, { status: 201 });
  } catch (error: unknown) {
    log('Failed to create decline reason', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create decline reason' },
      { status: 500 },
    );
  }
}
