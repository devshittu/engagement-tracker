// src/app/api/activity-continuity-logs/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:ACTIVITY_CONTINUITY_LOGS] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function GET(req: NextRequest) {
//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const token = authHeader.split(' ')[1];
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//   if (userError || !user) {
//     log('Failed to authenticate user:', userError?.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { data: userProfile, error: profileError } = await supabase
//     .from('users')
//     .select('id, email, departmentId, roles (id, name, level)')
//     .eq('id', user.id)
//     .single();

//   if (profileError || !userProfile) {
//     log('Failed to fetch user profile:', profileError?.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get('page') || '1', 10);
//     const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
//     const skip = (page - 1) * pageSize;

//     // Role-based access control
//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     const whereClause: any = {};
//     if (userRoleLevel < 3) {
//       whereClause.activity = {
//         departmentId: userProfile.departmentId,
//       };
//     }

//     log('Fetching continuity logs', { page, pageSize });
//     const [logs, total] = await Promise.all([
//       prisma.activityContinuityLog.findMany({
//         where: whereClause,
//         skip,
//         take: pageSize,
//         orderBy: { startDate: 'desc' },
//         include: {
//           activity: { include: { department: true } },
//           createdBy: true,
//         },
//       }),
//       prisma.activityContinuityLog.count({ where: whereClause }),
//     ]);

//     const serialized = logs.map((log) => ({
//       ...log,
//       startDate: log.startDate.toISOString(),
//       discontinuedDate: log.discontinuedDate?.toISOString() || null,
//     }));

//     log('Continuity logs fetched successfully', { count: logs.length });
//     return NextResponse.json({ logs: serialized, total, page, pageSize });
//   } catch (error) {
//     log('Failed to fetch continuity logs', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch continuity logs' },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const token = authHeader.split(' ')[1];
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//   if (userError || !user) {
//     log('Failed to authenticate user:', userError?.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { data: userProfile, error: profileError } = await supabase
//     .from('users')
//     .select('id, email, departmentId, roles (id, name, level)')
//     .eq('id', user.id)
//     .single();

//   if (profileError || !userProfile) {
//     log('Failed to fetch user profile:', profileError?.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const creatorId = userProfile.id;

//   let body: any; // Define body outside the try block
//   try {
//     body = await req.json();
//     const { activityId, startDate, duration } = body;
//     log('Creating continuity log', { activityId, startDate, duration });

//     if (
//       !Number.isInteger(activityId) ||
//       !startDate ||
//       !Number.isInteger(duration)
//     ) {
//       log('Invalid input');
//       return NextResponse.json(
//         { error: 'Activity ID, start date, and duration are required' },
//         { status: 400 },
//       );
//     }

//     const activity = await prisma.activity.findUnique({
//       where: { id: activityId },
//     });

//     if (!activity) {
//       log('Activity not found', { activityId });
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
//       log('Forbidden: User does not have permission to create a log for this activity');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const logEntry = await prisma.activityContinuityLog.create({
//       data: {
//         activityId,
//         startDate: new Date(startDate),
//         duration,
//         createdById: creatorId,
//       },
//       include: { activity: { include: { department: true } }, createdBy: true },
//     });

//     log('Continuity log created successfully', { id: logEntry.id });
//     return NextResponse.json(
//       {
//         ...logEntry,
//         startDate: logEntry.startDate.toISOString(),
//         discontinuedDate: logEntry.discontinuedDate?.toISOString() || null,
//       },
//       { status: 201 },
//     );
//   } catch (error: any) {
//     if (error.code === 'P2003') {
//       log('Invalid activity ID', { activityId: body?.activityId });
//       return NextResponse.json(
//         { error: 'Activity not found' },
//         { status: 404 },
//       );
//     }
//     log('Failed to create continuity log', error);
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
    `[API:ACTIVITY-CONTINUITY-LOGS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * pageSize;

  try {
    const userRoleLevel = userProfile.roles[0].level;
    const whereClause: any = {};
    if (userRoleLevel < 3) {
      whereClause.activity = {
        departmentId: userProfile.departmentId,
      };
    }

    log('Fetching continuity logs', { page, pageSize });
    const [logs, total] = await Promise.all([
      prisma.activityContinuityLog.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: {
          activity: { include: { department: true } },
          createdBy: true,
        },
      }),
      prisma.activityContinuityLog.count({ where: whereClause }),
    ]);

    const serialized = logs.map((log) => ({
      ...log,
      startDate: log.startDate.toISOString(),
      discontinuedDate: log.discontinuedDate?.toISOString() || null,
    }));

    log('Continuity logs fetched successfully', { count: logs.length });
    return NextResponse.json({ logs: serialized, total, page, pageSize });
  } catch (error: unknown) {
    log('Failed to fetch continuity logs', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch continuity logs' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile, userId } = authResult;

  let activityId: number | undefined = undefined;
  let startDate: string | undefined = undefined;
  let duration: number | undefined = undefined;

  try {
    const body = await req.json();
    activityId = body.activityId;
    startDate = body.startDate;
    duration = body.duration;

    log('Creating continuity log', { activityId, startDate, duration });

    if (
      !Number.isInteger(activityId) ||
      !startDate ||
      !Number.isInteger(duration)
    ) {
      log('Invalid input');
      return NextResponse.json(
        { error: 'Activity ID, start date, and duration are required' },
        { status: 400 },
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      log('Activity not found', { activityId });
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 },
      );
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (
      userRoleLevel < 3 &&
      activity.departmentId !== userProfile.departmentId
    ) {
      log(
        'Forbidden: User does not have permission to create a log for this activity',
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logEntry = await prisma.activityContinuityLog.create({
      data: {
        activityId: activityId!,
        startDate: new Date(startDate),
        duration: duration!,
        createdById: userId,
      },
      include: { activity: { include: { department: true } }, createdBy: true },
    });

    log('Continuity log created successfully', { id: logEntry.id });
    return NextResponse.json(
      {
        ...logEntry,
        startDate: logEntry.startDate.toISOString(),
        discontinuedDate: logEntry.discontinuedDate?.toISOString() || null,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        log('Invalid activity ID', { activityId });
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 },
        );
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
// src/app/api/activity-continuity-logs/route.ts
