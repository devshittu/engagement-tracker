// src/app/api/declined-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:DECLINED-SESSIONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const declinedSessions = await prisma.declinedSession.findMany({
      include: {
        session: {
          include: {
            admission: { include: { serviceUser: true, ward: true } },
            activityLog: { include: { activity: true } },
            facilitatedBy: true,
          },
        },
        declineReason: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    log('Fetched declined sessions', { count: declinedSessions.length });
    return NextResponse.json(declinedSessions);
  } catch (error: unknown) {
    log('Failed to fetch declined sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch declined sessions' },
      { status: 500 },
    );
  }
}
