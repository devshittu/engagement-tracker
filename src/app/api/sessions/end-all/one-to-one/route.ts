
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionType, SessionStatus } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(`[API:SESSIONS/END-ALL/ONE-TO-ONE] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date();
    const result = await prisma.session.updateMany({
      where: {
        type: SessionType.ONE_TO_ONE,
        status: SessionStatus.SCHEDULED,
        timeOut: null,
      },
      data: {
        status: SessionStatus.COMPLETED,
        timeOut: now,
      },
    });

    log('Ended all active one-to-one sessions', { count: result.count });
    return NextResponse.json({
      message: `Ended ${result.count} one-to-one sessions`,
      count: result.count,
    });
  } catch (error: unknown) {
    log('Failed to end one-to-one sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to end one-to-one sessions' }, { status: 500 });
  }
}
// src/app/api/sessions/end-all/one-to-one/route.ts
