import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SessionType, SessionStatus } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/END-ALL/ONE-TO-ONE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  } catch (error) {
    log('Failed to end one-to-one sessions', error);
    return NextResponse.json(
      { error: 'Failed to end one-to-one sessions' },
      { status: 500 },
    );
  }
}
// src/app/api/sessions/end-all/one-to-one/route.ts
