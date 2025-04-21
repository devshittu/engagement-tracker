// src/app/api/group-sessions/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { authenticateRequest } from '@/lib/authMiddleware';
// import { SessionType, SessionStatus } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';

// const log = (message: string, data?: any) =>
//   console.log(`[API:GROUP-SESSIONS] ${message}`, data ? JSON.stringify(data, null, 2) : '');

// export async function GET(req: NextRequest) {
//   const authResult = await authenticateRequest(req, 0, undefined, log);
//   if (authResult instanceof NextResponse) return authResult;

//   try {
//     const { searchParams } = new URL(req.url);
//     const activityLogId = searchParams.get('activityLogId');
//     const type = searchParams.get('type') as SessionType | null;
//     const whereClause = {
//       type: type || SessionType.GROUP,
//       status: SessionStatus.SCHEDULED,
//       timeOut: null,
//       ...(activityLogId ? { activityLogId: Number(activityLogId) } : {}),
//     };

//     log('Fetching active group sessions', { activityLogId, type });
//     const sessions = await prisma.session.findMany({
//       where: whereClause,
//       include: {
//         facilitatedBy: true,
//         activityLog: { include: { activity: true } },
//         admission: { include: { serviceUser: true, ward: true } },
//       },
//     });

//     const serialized = sessions.map((session) => ({
//       ...session,
//       timeIn: session.timeIn.toISOString(),
//       timeOut: session.timeOut?.toISOString() || null,
//       createdAt: session.createdAt.toISOString(),
//       updatedAt: session.updatedAt?.toISOString() || null,
//     }));

//     log('Active group sessions fetched successfully', { count: sessions.length });
//     return NextResponse.json({ sessions: serialized });
//   } catch (error) {
//     log('Failed to fetch active group sessions', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch active group sessions' },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   const authResult = await authenticateRequest(req, 0, undefined, log);
//   if (authResult instanceof NextResponse) return authResult;

//   const { userId: facilitatorId } = authResult;

//   try {
//     const body = await req.json();
//     log('Received request body:', body);

//     const { type, activityLogId, admissionIds } = body;
//     log('Creating group session', { type, activityLogId, admissionIds });

//     if (
//       type !== SessionType.GROUP ||
//       !activityLogId ||
//       !Number.isInteger(activityLogId) ||
//       !Array.isArray(admissionIds)
//     ) {
//       log('Invalid input', { type, activityLogId, admissionIds });
//       return NextResponse.json(
//         {
//           error:
//             'Invalid input: type must be GROUP, activityLogId and admissionIds are required',
//         },
//         { status: 400 },
//       );
//     }

//     if (admissionIds.length === 0) {
//       log('At least one admission ID is required');
//       return NextResponse.json(
//         { error: 'At least one admission ID is required' },
//         { status: 400 },
//       );
//     }

//     const now = new Date();
//     const activityLog = await prisma.activityContinuityLog.findUnique({
//       where: { id: activityLogId },
//       include: { activity: true },
//     });
//     if (
//       !activityLog ||
//       activityLog.discontinuedDate ||
//       activityLog.startDate > now
//     ) {
//       log('Activity log not found or discontinued', { activityLogId });
//       return NextResponse.json(
//         { error: 'Activity log not found or discontinued' },
//         { status: 404 },
//       );
//     }

//     const validAdmissions = await prisma.admission.findMany({
//       where: { id: { in: admissionIds } },
//     });
//     if (validAdmissions.length !== admissionIds.length) {
//       log('Invalid admission IDs', {
//         admissionIds,
//         validCount: validAdmissions.length,
//       });
//       return NextResponse.json(
//         { error: 'One or more admission IDs are invalid' },
//         { status: 400 },
//       );
//     }

//     const existingSession = await prisma.session.findFirst({
//       where: {
//         type: SessionType.GROUP,
//         activityLogId,
//         status: SessionStatus.SCHEDULED,
//         timeOut: null,
//       },
//       include: { admission: true },
//     });

//     if (existingSession) {
//       log('Existing group session found', { groupRef: existingSession.groupRef });
//       return NextResponse.json(
//         {
//           ...existingSession,
//           timeIn: existingSession.timeIn.toISOString(),
//           timeOut: existingSession.timeOut?.toISOString() || null,
//           createdAt: existingSession.createdAt.toISOString(),
//           updatedAt: existingSession.updatedAt?.toISOString() || null,
//         },
//         { status: 200 },
//       );
//     }

//     const groupRef = uuidv4();
//     const groupDescription = activityLog.activity.name;

//     const sessions = await Promise.all(
//       admissionIds.map((admissionId: number) =>
//         prisma.session.create({
//           data: {
//             type: SessionType.GROUP,
//             status: SessionStatus.SCHEDULED,
//             facilitatedById: facilitatorId,
//             activityLogId,
//             admissionId,
//             groupRef,
//             groupDescription,
//             timeIn: now,
//           },
//           include: {
//             facilitatedBy: true,
//             activityLog: { include: { activity: true } },
//             admission: { include: { serviceUser: true, ward: true } },
//           },
//         }),
//       ),
//     );

//     log('Group session created successfully', {
//       groupRef,
//       sessionCount: sessions.length,
//     });
//     return NextResponse.json(
//       {
//         sessions: sessions.map((session) => ({
//           ...session,
//           timeIn: session.timeIn.toISOString(),
//           timeOut: session.timeOut?.toISOString() || null,
//           createdAt: session.createdAt.toISOString(),
//           updatedAt: session.updatedAt?.toISOString() || null,
//         })),
//       },
//       { status: 201 },
//     );
//   } catch (error: any) {
//     log('Failed to create group session', error);
//     if (error.code === 'P2003') {
//       return NextResponse.json(
//         { error: 'Invalid activity log or admission ID' },
//         { status: 404 },
//       );
//     }
//     return NextResponse.json(
//       { error: error.message || 'Failed to create group session' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionType, SessionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, logger.info);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const activityLogId = searchParams.get('activityLogId');
    const type = searchParams.get('type') as SessionType | null;
    const whereClause = {
      type: type || SessionType.GROUP,
      status: SessionStatus.SCHEDULED,
      timeOut: null,
      ...(activityLogId ? { activityLogId: Number(activityLogId) } : {}),
    };

    logger.debug('Fetching active group sessions', { activityLogId, type });
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        facilitatedBy: true,
        activityLog: { include: { activity: true } },
        admission: { include: { serviceUser: true, ward: true } },
      },
    });

    const serialized = sessions.map((session) => ({
      ...session,
      timeIn: session.timeIn.toISOString(),
      timeOut: session.timeOut?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt?.toISOString() || null,
    }));

    logger.info('Active group sessions fetched successfully', {
      count: sessions.length,
    });
    return NextResponse.json({ sessions: serialized });
  } catch (error) {
    logger.error('Failed to fetch active group sessions', { error });
    return NextResponse.json(
      { error: 'Failed to fetch active group sessions' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, logger.info);
  if (authResult instanceof NextResponse) return authResult;

  const { userId: facilitatorId } = authResult;

  try {
    const body = await req.json();
    logger.debug('Received request body', { body });

    const { type, activityLogId, admissionIds } = body;
    logger.info('Creating group session', {
      type,
      activityLogId,
      admissionIds,
    });

    if (
      type !== SessionType.GROUP ||
      !activityLogId ||
      !Number.isInteger(activityLogId) ||
      !Array.isArray(admissionIds)
    ) {
      logger.warn('Invalid input', { type, activityLogId, admissionIds });
      return NextResponse.json(
        {
          error:
            'Invalid input: type must be GROUP, activityLogId and admissionIds are required',
        },
        { status: 400 },
      );
    }

    if (admissionIds.length === 0) {
      logger.warn('At least one admission ID is required');
      return NextResponse.json(
        { error: 'At least one admission ID is required' },
        { status: 400 },
      );
    }

    const now = new Date();
    const activityLog = await prisma.activityContinuityLog.findUnique({
      where: { id: activityLogId },
      include: { activity: true },
    });
    if (
      !activityLog ||
      activityLog.discontinuedDate ||
      activityLog.startDate > now
    ) {
      logger.error('Activity log not found or discontinued', { activityLogId });
      return NextResponse.json(
        { error: 'Activity log not found or discontinued' },
        { status: 404 },
      );
    }

    const validAdmissions = await prisma.admission.findMany({
      where: { id: { in: admissionIds } },
    });
    if (validAdmissions.length !== admissionIds.length) {
      logger.error('Invalid admission IDs', {
        admissionIds,
        validCount: validAdmissions.length,
      });
      return NextResponse.json(
        { error: 'One or more admission IDs are invalid' },
        { status: 400 },
      );
    }

    const existingSession = await prisma.session.findFirst({
      where: {
        type: SessionType.GROUP,
        activityLogId,
        status: SessionStatus.SCHEDULED,
        timeOut: null,
      },
      include: { admission: true },
    });

    if (existingSession) {
      logger.info('Existing group session found', {
        groupRef: existingSession.groupRef,
      });
      return NextResponse.json(
        {
          ...existingSession,
          timeIn: existingSession.timeIn.toISOString(),
          timeOut: existingSession.timeOut?.toISOString() || null,
          createdAt: existingSession.createdAt.toISOString(),
          updatedAt: existingSession.updatedAt?.toISOString() || null,
        },
        { status: 200 },
      );
    }

    const groupRef = uuidv4();
    const groupDescription = activityLog.activity.name;

    const sessions = await Promise.all(
      admissionIds.map((admissionId: number) =>
        prisma.session.create({
          data: {
            type: SessionType.GROUP,
            status: SessionStatus.SCHEDULED,
            facilitatedById: facilitatorId,
            activityLogId,
            admissionId,
            groupRef,
            groupDescription,
            timeIn: now,
          },
          include: {
            facilitatedBy: true,
            activityLog: { include: { activity: true } },
            admission: { include: { serviceUser: true, ward: true } },
          },
        }),
      ),
    );

    logger.info('Group session created successfully', {
      groupRef,
      sessionCount: sessions.length,
    });
    return NextResponse.json(
      {
        sessions: sessions.map((session) => ({
          ...session,
          timeIn: session.timeIn.toISOString(),
          timeOut: session.timeOut?.toISOString() || null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt?.toISOString() || null,
        })),
      },
      { status: 201 },
    );
  } catch (error: any) {
    logger.error('Failed to create group session', {
      error: error.message,
      stack: error.stack,
    });
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid activity log or admission ID' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create group session' },
      { status: 500 },
    );
  }
}
// src/app/api/group-sessions/route.ts
