// src/app/api/sessions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userHeader = request.headers.get('x-supabase-user');
  if (!userHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  try {
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        skip,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: {
          createdBy: true,
          serviceUser: true,
          groupSession: {
            include: {
              participants: {
                include: { serviceUser: true },
              },
            },
          },
        },
      }),
      prisma.session.count(),
    ]);

    return NextResponse.json({ sessions, total }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const userHeader = request.headers.get('x-supabase-user');
  if (!userHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userHeader);
  const userId = user.id;

  const body = await request.json();
  const { type, serviceUserId, groupRef, participants } = body;

  if (
    !type ||
    (type === 'ONE_TO_ONE' && !serviceUserId) ||
    (type === 'GROUP' && !groupRef)
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const sessionData: any = {
      type,
      createdById: userId,
      startDate: new Date(),
      endDate: null,
    };

    if (type === 'ONE_TO_ONE') {
      sessionData.serviceUserId = serviceUserId;
    }

    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: sessionData,
        include: { createdBy: true, serviceUser: true },
      });

      if (type === 'GROUP') {
        const groupSession = await tx.groupSession.create({
          data: {
            sessionId: newSession.id,
            groupRef,
            participants: {
              create: participants?.map((participantId: string) => ({
                serviceUserId: participantId,
              })),
            },
          },
          include: {
            participants: {
              include: { serviceUser: true },
            },
          },
        });
        return { ...newSession, groupSession };
      }

      return newSession;
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}

// Additional methods (PUT, DELETE) can be added as needed
// src/app/api/sessions/route.ts
