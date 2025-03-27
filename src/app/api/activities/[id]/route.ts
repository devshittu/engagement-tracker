// src/app/api/activities/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';
// import { UpdateActivityInput } from '@/features/activities/types';

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

//     const activity = await prisma.activity.findUnique({
//       where: { id: parseInt(params.id) },
//       include: { department: true },
//     });

//     if (!activity) {
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     // Role-based access control: Check if user has permission to view this activity
//     if (userProfile.roles.length === 0) {
//       console.log('API: User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     return NextResponse.json(activity, { status: 200 });
//   } catch (error: unknown) {
//     console.error(`Error fetching activity ${params.id}:`, error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

//     const body: UpdateActivityInput = await request.json();
//     const activity = await prisma.activity.findUnique({
//       where: { id: parseInt(params.id) },
//     });

//     if (!activity) {
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     // Role-based access control: Check if user has permission to update this activity
//     if (userProfile.roles.length === 0) {
//       console.log('API: User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const updatedActivity = await prisma.activity.update({
//       where: { id: parseInt(params.id) },
//       data: {
//         name: body.name,
//         description: body.description,
//         departmentId: body.departmentId ?? null,
//         updatedAt: new Date(),
//       },
//       include: { department: true },
//     });

//     return NextResponse.json(updatedActivity, { status: 200 });
//   } catch (error: unknown) {
//     console.error(`Error updating activity ${params.id}:`, error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

//     const activity = await prisma.activity.findUnique({
//       where: { id: parseInt(params.id) },
//     });

//     if (!activity) {
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     // Role-based access control: Check if user has permission to delete this activity
//     if (userProfile.roles.length === 0) {
//       console.log('API: User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     await prisma.activity.delete({
//       where: { id: parseInt(params.id) },
//     });

//     return NextResponse.json({ message: 'Activity deleted successfully' }, { status: 200 });
//   } catch (error: unknown) {
//     console.error(`Error deleting activity ${params.id}:`, error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';
import { UpdateActivityInput } from '@/features/activities/types';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;
  const { id } = params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    log('Invalid activity ID', { id });
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  try {
    log('Fetching activity', { id: activityId });
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { department: true },
    });

    if (!activity) {
      log('Activity not found', { id: activityId });
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to view this activity');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    log('Activity fetched successfully', { id: activity.id });
    return NextResponse.json(activity);
  } catch (error: unknown) {
    log('Failed to fetch activity', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;
  const { id } = params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    log('Invalid activity ID', { id });
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  let body: UpdateActivityInput;
  try {
    body = await req.json();
    log('Updating activity', { id: activityId, body });

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      log('Activity not found', { id: activityId });
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to update this activity');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        name: body.name,
        description: body.description,
        departmentId: body.departmentId ?? null,
        updatedAt: new Date(),
      },
      include: { department: true },
    });

    log('Activity updated successfully', { id: updatedActivity.id });
    return NextResponse.json(updatedActivity);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Activity not found', { id: activityId });
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
    }
    log('Failed to update activity', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;
  const { id } = params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    log('Invalid activity ID', { id });
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  try {
    log('Deleting activity', { id: activityId });
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      log('Activity not found', { id: activityId });
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to delete this activity');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.activity.delete({
      where: { id: activityId },
    });

    log('Activity deleted successfully', { id: activityId });
    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Activity not found', { id: activityId });
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
    }
    log('Failed to delete activity', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// src/app/api/activities/[id]/route.ts