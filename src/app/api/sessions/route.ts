// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(`[API:SESSIONS] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const page: number = parseInt(searchParams.get('page') || '1', 10);
  const pageSize: number = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip: number = (page - 1) * pageSize;

  try {
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        skip,
        take: pageSize,
        orderBy: { timeIn: 'desc' }, // Adjusted from 'startDate' to 'timeIn' per schema
        include: {
          facilitatedBy: true, // Adjusted from 'createdBy' to 'facilitatedBy' per schema
          admission: { include: { serviceUser: true } }, // Adjusted to match schema
        },
      }),
      prisma.session.count(),
    ]);

    const serialized = sessions.map((session) => ({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
    }));

    log('Sessions fetched successfully', { count: sessions.length, total });
    return NextResponse.json({ sessions: serialized, total }, { status: 200 });
  } catch (error: unknown) {
    log('Failed to fetch sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const body = await req.json();
  const { type, admissionId, groupRef } = body; // Explicitly declared

  if (!type || (type === 'ONE_TO_ONE' && !admissionId) || (type === 'GROUP' && !groupRef)) {
    log('Invalid input', { type, admissionId, groupRef });
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const sessionData: any = {
      type,
      facilitatedById: userId, // Adjusted from 'createdById' to 'facilitatedById'
      timeIn: new Date(), // Adjusted from 'startDate' to 'timeIn'
      timeOut: null,
    };

    if (type === 'ONE_TO_ONE') {
      sessionData.admissionId = admissionId;
      // Placeholder for activityLogId as required by schema
      const defaultActivityLog = await prisma.activityContinuityLog.findFirst();
      if (!defaultActivityLog) throw new Error('No activity log available');
      sessionData.activityLogId = defaultActivityLog.id;
    }

    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: sessionData,
        include: { facilitatedBy: true, admission: { include: { serviceUser: true } } },
      });

      if (type === 'GROUP') {
        // Simplified: schema doesn't have 'groupSession', using groupRef directly
        const groupSession = await tx.session.update({
          where: { id: newSession.id },
          data: { groupRef },
          include: { facilitatedBy: true, admission: { include: { serviceUser: true } } },
        });
        return groupSession;
      }

      return newSession;
    });

    log('Session created successfully', { id: session.id });
    return NextResponse.json({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
    }, { status: 201 });
  } catch (error: unknown) {
    log('Failed to create session', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// src/app/api/sessions/route.ts
// src/app/api/sessions/route.ts