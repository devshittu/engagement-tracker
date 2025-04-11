// src/app/api/activities/[id]/activate/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { authenticateRequest } from '@/lib/authMiddleware';
// import { Prisma } from '@prisma/client';

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:ACTIVITIES/ACTIVATE] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   const authResult = await authenticateRequest(req, 3, undefined, log);
//   if (authResult instanceof NextResponse) return authResult;

//   const { userProfile, userId } = authResult;
//   const { id } = params;
//   const activityId = parseInt(id);

//   if (isNaN(activityId)) {
//     log('Invalid activity ID', { id });
//     return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
//   }

//   try {
//     log('Checking activity existence', { activityId });
//     const activity = await prisma.activity.findUnique({
//       where: { id: activityId },
//     });

//     if (!activity) {
//       log('Activity not found', { activityId });
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
//       log('Forbidden: User does not have permission to activate this activity');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     log('Activating activity', { activityId });
//     const logEntry = await prisma.activityContinuityLog.create({
//       data: {
//         activityId,
//         startDate: new Date(),
//         duration: 180, // Default 3 hours as per seed
//         createdById: userId,
//       },
//       include: { activity: { include: { department: true } } },
//     });

//     log('Activity continuity log created successfully', { id: logEntry.id });
//     return NextResponse.json(logEntry, { status: 201 });
//   } catch (error: unknown) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === 'P2003') {
//         log('Activity not found', { activityId });
//         return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//       }
//     }
//     log('Failed to create continuity log', {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return NextResponse.json(
//       { error: 'Failed to create continuity log' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/ACTIVATE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Update type to Promise
) {
  const { id } = await params; // Await the Promise to get the id
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile, userId } = authResult;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    log('Invalid activity ID', { id });
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  try {
    log('Checking activity existence', { activityId });
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      log('Activity not found', { activityId });
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to activate this activity');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    log('Activating activity', { activityId });
    const logEntry = await prisma.activityContinuityLog.create({
      data: {
        activityId,
        startDate: new Date(),
        duration: 180, // Default 3 hours as per seed
        createdById: userId,
      },
      include: { activity: { include: { department: true } } },
    });

    log('Activity continuity log created successfully', { id: logEntry.id });
    return NextResponse.json(logEntry, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        log('Activity not found', { activityId });
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
    }
    log('Failed to create continuity log', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create continuity log' },
      { status: 500 },
    );
  }
}
// src/app/api/activities/[id]/activate/route.ts