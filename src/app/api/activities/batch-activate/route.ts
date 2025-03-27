// src/app/api/activities/batch-activate/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';

// const log = (message: string, data?: any) => console.log(`[API:ACTIVITIES/BATCH-ACTIVATE] ${message}`, data ? JSON.stringify(data, null, 2) : '');

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
//   const { activityIds }: { activityIds: number[] } = await req.json();

//   if (!Array.isArray(activityIds) || activityIds.length === 0) {
//     log('Invalid request: activityIds must be a non-empty array');
//     return NextResponse.json({ error: 'Invalid request: activityIds must be a non-empty array' }, { status: 400 });
//   }

//   try {
//     // Fetch activities to check permissions
//     const activities = await prisma.activity.findMany({
//       where: { id: { in: activityIds } },
//     });

//     if (activities.length !== activityIds.length) {
//       log('Some activities not found', { requested: activityIds.length, found: activities.length });
//       return NextResponse.json({ error: 'Some activities not found' }, { status: 404 });
//     }

//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     // Role-based access control: Ensure user can activate all specified activities
//     if (userRoleLevel < 3) {
//       const invalidActivities = activities.filter(
//         (activity) => activity.departmentId !== userProfile.departmentId
//       );
//       if (invalidActivities.length > 0) {
//         log('Forbidden: User does not have permission to activate some activities');
//         return NextResponse.json({ error: 'Forbidden: You do not have permission to activate some activities' }, { status: 403 });
//       }
//     }

//     // Create activity continuity logs for each activity
//     const logEntries = await prisma.activityContinuityLog.createMany({
//       data: activityIds.map((activityId) => ({
//         activityId,
//         startDate: new Date(),
//         duration: 180, // Default 3 hours as per seed
//         createdById: creatorId,
//       })),
//     });

//     log('Batch activated activities', { count: logEntries.count });
//     return NextResponse.json({ message: `Successfully activated ${logEntries.count} activities` }, { status: 201 });
//   } catch (error: any) {
//     log('Failed to batch activate activities', error);
//     return NextResponse.json({ error: 'Failed to batch activate activities' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/BATCH-ACTIVATE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest) {
  // Step 1: Authenticate with requiredRoleLevel: 3 (consistent with other activity routes)
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile, userId } = authResult;
  const creatorId = userId; // Alias for clarity

  // Step 2: Parse request body
  let activityIds: number[];
  try {
    const body = await req.json();
    activityIds = body.activityIds;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      log('Invalid request: activityIds must be a non-empty array');
      return NextResponse.json(
        { error: 'Invalid request: activityIds must be a non-empty array' },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    log('Failed to parse request body', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  try {
    // Fetch activities to check permissions
    log('Fetching activities for batch activation', { activityIds });
    const activities = await prisma.activity.findMany({
      where: { id: { in: activityIds } },
    });

    if (activities.length !== activityIds.length) {
      log('Some activities not found', {
        requested: activityIds.length,
        found: activities.length,
      });
      return NextResponse.json(
        { error: 'Some activities not found' },
        { status: 404 },
      );
    }

    // Role-based access control: Ensure user can activate all specified activities
    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3) {
      const invalidActivities = activities.filter(
        (activity) => activity.departmentId !== userProfile.departmentId,
      );
      if (invalidActivities.length > 0) {
        log('Forbidden: User does not have permission to activate some activities', {
          invalidCount: invalidActivities.length,
        });
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to activate some activities' },
          { status: 403 },
        );
      }
    }

    // Create activity continuity logs for each activity
    log('Creating batch activity continuity logs', { count: activityIds.length });
    const logEntries = await prisma.activityContinuityLog.createMany({
      data: activityIds.map((activityId) => ({
        activityId,
        startDate: new Date(),
        duration: 180, // Default 3 hours as per seed
        createdById: creatorId,
      })),
    });

    log('Batch activated activities', { count: logEntries.count });
    return NextResponse.json(
      { message: `Successfully activated ${logEntries.count} activities` },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      // Prisma-specific error handling
      if ((error as any).code === 'P2003') {
        log('Some activities not found during log creation', { activityIds });
        return NextResponse.json(
          { error: 'Some activities not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to batch activate activities', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to batch activate activities' },
      { status: 500 },
    );
  }
}
// src/app/api/activities/batch-activate/route.ts