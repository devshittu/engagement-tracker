// src/app/api/activities/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';
// import { Activity } from '@/features/activities/types';

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.split(' ')[1];
//     const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//     if (userError || !user) {
//       console.log('API: Failed to authenticate user:', userError?.message);
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { data: userProfile, error: profileError } = await supabase
//       .from('users')
//       .select('id, email, departmentId, roles (id, name, level)')
//       .eq('id', user.id)
//       .single();

//     if (profileError || !userProfile) {
//       console.log('API: Failed to fetch user profile:', profileError?.message);
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const searchParams = request.nextUrl.searchParams;
//     const page = parseInt(searchParams.get('page') || '1');
//     const pageSize = parseInt(searchParams.get('pageSize') || '20');
//     const departmentId = searchParams.get('departmentId')
//       ? parseInt(searchParams.get('departmentId')!)
//       : undefined;

//     if (userProfile.roles.length === 0) {
//       console.log('API: User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     const whereClause: any = {};

//     // If user role level is less than 3, filter by their department
//     if (userRoleLevel < 3) {
//       whereClause.departmentId = userProfile.departmentId;
//     } else if (departmentId) {
//       // For users with role.level >= 4, allow filtering by selected department
//       whereClause.departmentId = departmentId;
//     }

//     const total = await prisma.activity.count({ where: whereClause });
//     const activities = await prisma.activity.findMany({
//       where: whereClause,
//       include: { department: true },
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//     });

//     const serializedActivities = activities.map((activity) => ({
//       ...activity,
//       createdAt: activity.createdAt.toISOString(),
//       updatedAt: activity.updatedAt ? activity.updatedAt.toISOString() : null,
//     }));

//     return NextResponse.json(
//       { activities: serializedActivities, total },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     console.error('Error fetching activities:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.split(' ')[1];
//     const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//     if (userError || !user) {
//       console.log('API: Failed to authenticate user:', userError?.message);
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { data: userProfile, error: profileError } = await supabase
//       .from('users')
//       .select('id, email, departmentId, roles (id, name, level)')
//       .eq('id', user.id)
//       .single();

//     if (profileError || !userProfile) {
//       console.log('API: Failed to fetch user profile:', profileError?.message);
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
//     if (!body.name) {
//       return NextResponse.json({ error: 'Activity name is required' }, { status: 400 });
//     }

//     if (userProfile.roles.length === 0) {
//       console.log('API: User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     const departmentId = body.departmentId ?? userProfile.departmentId;

//     // Role-based access control: Ensure user can create activities in the specified department
//     if (userRoleLevel < 3 && departmentId !== userProfile.departmentId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const newActivity = await prisma.activity.create({
//       data: {
//         name: body.name,
//         description: body.description,
//         departmentId: departmentId,
//         createdAt: new Date(),
//       },
//       include: { department: true },
//     });

//     return NextResponse.json(newActivity, { status: 201 });
//   } catch (error: unknown) {
//     console.error('Error creating activity:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';
import { Activity } from '@/features/activities/types';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const departmentId = searchParams.get('departmentId')
    ? parseInt(searchParams.get('departmentId')!)
    : undefined;

  try {
    const userRoleLevel = userProfile.roles[0].level;
    const whereClause: any = {};

    if (userRoleLevel < 3) {
      whereClause.departmentId = userProfile.departmentId;
    } else if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    log('Fetching activities', { page, pageSize, whereClause });
    const total = await prisma.activity.count({ where: whereClause });
    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: { department: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const serializedActivities = activities.map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt ? activity.updatedAt.toISOString() : null,
    }));

    log('Activities fetched successfully', { count: activities.length });
    return NextResponse.json({ activities: serializedActivities, total });
  } catch (error: unknown) {
    log('Failed to fetch activities', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;

  let body: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = { name: '', description: '', departmentId: 0, department: null };
  try {
    body = await req.json();
    log('Creating activity', { body });

    if (!body.name) {
      log('Activity name is required');
      return NextResponse.json({ error: 'Activity name is required' }, { status: 400 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    const departmentId = body.departmentId ?? userProfile.departmentId;

    if (userRoleLevel < 3 && departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to create in this department');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newActivity = await prisma.activity.create({
      data: {
        name: body.name,
        description: body.description,
        departmentId: departmentId,
        createdAt: new Date(),
      },
      include: { department: true },
    });

    log('Activity created successfully', { id: newActivity.id });
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        log('Activity name already exists', { name: body?.name });
        return NextResponse.json(
          { error: 'Activity name already exists' },
          { status: 409 },
        );
      }
    }
    log('Failed to create activity', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// src/app/api/activities/route.ts
