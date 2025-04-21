// src/app/api/reports/sessions/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { SessionType, SessionStatus } from '@prisma/client';

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:SESSIONS] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get('page') || '1', 10);
//     const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
//     const skip = (page - 1) * pageSize;
//     const status = searchParams.get('status') as SessionStatus | undefined;

//     const whereClause = status ? { status } : {};

//     log('Fetching sessions', { page, pageSize, status });
//     const [sessions, total] = await Promise.all([
//       prisma.session.findMany({
//         where: whereClause,
//         skip,
//         take: pageSize,
//         orderBy: { timeIn: 'desc' },
//         include: {
//           facilitatedBy: true,
//           activityLog: { include: { activity: true } },
//           admission: { include: { serviceUser: true, ward: true } },
//         },
//       }),
//       prisma.session.count({ where: whereClause }),
//     ]);

//     const serialized = sessions.map((session) => ({
//       ...session,
//       timeIn: session.timeIn.toISOString(),
//       timeOut: session.timeOut?.toISOString() || null,
//       createdAt: session.createdAt.toISOString(),
//       updatedAt: session.updatedAt?.toISOString() || null,
//     }));

//     log('Sessions fetched successfully', { count: sessions.length });
//     return NextResponse.json({ sessions: serialized, total, page, pageSize });
//   } catch (error) {
//     log('Failed to fetch sessions', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch sessions' },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const user = JSON.parse(userJson);
//   const facilitatorId = user.id;

//   try {
//     const { type, activityLogId, admissionId } = await req.json();
//     log('Creating session', { type, activityLogId, admissionId });

//     // Validate inputs
//     if (
//       !type ||
//       !activityLogId ||
//       !Number.isInteger(activityLogId) ||
//       !admissionId ||
//       !Number.isInteger(admissionId)
//     ) {
//       log('Invalid input');
//       return NextResponse.json(
//         { error: 'Type, activityLogId, and admissionId are required' },
//         { status: 400 },
//       );
//     }

//     if (type !== SessionType.ONE_TO_ONE) {
//       log('Session type must be ONE_TO_ONE');
//       return NextResponse.json(
//         { error: 'Session type must be ONE_TO_ONE' },
//         { status: 400 },
//       );
//     }

//     // Check if activity log exists (remove discontinuedDate check per requirement)
//     const activityLog = await prisma.activityContinuityLog.findUnique({
//       where: { id: activityLogId },
//       include: { activity: true },
//     });
//     if (!activityLog) {
//       log('Activity log not found', { activityLogId });
//       return NextResponse.json(
//         { error: 'Activity log not found' },
//         { status: 404 },
//       );
//     }

//     // Check if admission exists
//     const admission = await prisma.admission.findUnique({
//       where: { id: admissionId },
//     });
//     if (!admission) {
//       log('Admission not found', { admissionId });
//       return NextResponse.json(
//         { error: 'Admission not found' },
//         { status: 404 },
//       );
//     }

//     const now = new Date();
//     const session = await prisma.session.create({
//       data: {
//         type: SessionType.ONE_TO_ONE,
//         status: SessionStatus.SCHEDULED,
//         facilitatedById: facilitatorId,
//         activityLogId,
//         admissionId,
//         timeIn: now,
//       },
//       include: {
//         facilitatedBy: true,
//         activityLog: { include: { activity: true } },
//         admission: { include: { serviceUser: true, ward: true } },
//       },
//     });

//     log('Session created successfully', { sessionId: session.id });
//     return NextResponse.json(
//       {
//         ...session,
//         timeIn: session.timeIn.toISOString(),
//         timeOut: session.timeOut?.toISOString() || null,
//         createdAt: session.createdAt.toISOString(),
//         updatedAt: session.updatedAt?.toISOString() || null,
//       },
//       { status: 201 },
//     );
//   } catch (error: any) {
//     if (error.code === 'P2003') {
//       log('Invalid foreign key', { error });
//       return NextResponse.json(
//         { error: 'Invalid activity log or admission ID' },
//         { status: 404 },
//       );
//     }
//     log('Failed to create session', error);
//     return NextResponse.json(
//       { error: 'Failed to create session' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionType, SessionStatus } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;
    const status = searchParams.get('status') as SessionStatus | undefined;

    const whereClause = status ? { status } : {};

    log('Fetching sessions', { page, pageSize, status });
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { timeIn: 'desc' },
        include: {
          facilitatedBy: true,
          activityLog: { include: { activity: true } },
          admission: { include: { serviceUser: true, ward: true } },
        },
      }),
      prisma.session.count({ where: whereClause }),
    ]);

    const serialized = sessions.map((session) => ({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
    }));

    log('Sessions fetched successfully', { count: sessions.length });
    return NextResponse.json({ sessions: serialized, total, page, pageSize });
  } catch (error: unknown) {
    log('Failed to fetch sessions', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult; // User object from Supabase
  const facilitatorId = user.userId;

  try {
    const { type, activityLogId, admissionId } = await req.json();
    log('Creating session', { type, activityLogId, admissionId });

    // Validate inputs
    if (
      !type ||
      !activityLogId ||
      !Number.isInteger(activityLogId) ||
      !admissionId ||
      !Number.isInteger(admissionId)
    ) {
      log('Invalid input');
      return NextResponse.json(
        { error: 'Type, activityLogId, and admissionId are required' },
        { status: 400 },
      );
    }

    if (type !== SessionType.ONE_TO_ONE) {
      log('Session type must be ONE_TO_ONE');
      return NextResponse.json(
        { error: 'Session type must be ONE_TO_ONE' },
        { status: 400 },
      );
    }

    const activityLog = await prisma.activityContinuityLog.findUnique({
      where: { id: activityLogId },
      include: { activity: true },
    });
    if (!activityLog) {
      log('Activity log not found', { activityLogId });
      return NextResponse.json(
        { error: 'Activity log not found' },
        { status: 404 },
      );
    }

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
    });
    if (!admission) {
      log('Admission not found', { admissionId });
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      );
    }

    const now = new Date();
    const session = await prisma.session.create({
      data: {
        type: SessionType.ONE_TO_ONE,
        status: SessionStatus.SCHEDULED,
        facilitatedById: facilitatorId,
        activityLogId,
        admissionId,
        timeIn: now,
      },
      include: {
        facilitatedBy: true,
        activityLog: { include: { activity: true } },
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    log('Session created successfully', { sessionId: session.id });
    return NextResponse.json(
      {
        ...session,
        timeIn: session.timeIn.toISOString(),
        timeOut: session.timeOut?.toISOString() || null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt?.toISOString() || null,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 'P2003') {
      log('Invalid foreign key', { error });
      return NextResponse.json(
        { error: 'Invalid activity log or admission ID' },
        { status: 404 },
      );
    }
    log('Failed to create session', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/sessions/route.ts
