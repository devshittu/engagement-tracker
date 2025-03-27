// src/app/api/activities/active/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';

// const log = (message: string, data?: any) => console.log(`[API:ACTIVITIES/ACTIVE] ${message}`, data ? JSON.stringify(data, null, 2) : '');

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
//     const now = new Date();
//     const whereClause: any = {
//       startDate: { lte: now },
//       discontinuedDate: null,
//     };

//     // If user role level is less than 3, filter by their department
//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3) {
//       whereClause.activity = {
//         departmentId: userProfile.departmentId,
//       };
//     }

//     const activeActivityLogs = await prisma.activityContinuityLog.findMany({
//       where: whereClause,
//       include: {
//         activity: true,
//       },
//     });

//     const serialized = activeActivityLogs.map((log) => ({
//       id: log.id,
//       name: log.activity.name,
//       startDate: log.startDate.toISOString(),
//     }));

//     log('Fetched active activity logs', { count: serialized.length });
//     return NextResponse.json(serialized);
//   } catch (error) {
//     log('Failed to fetch active activity logs', error);
//     return NextResponse.json({ error: 'Failed to fetch active activity logs' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/ACTIVE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 3
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;

  try {
    const now = new Date();
    const whereClause: any = {
      startDate: { lte: now },
      discontinuedDate: null,
    };

    // If user role level is less than 3, filter by their department
    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3) {
      whereClause.activity = {
        departmentId: userProfile.departmentId,
      };
    }

    log('Fetching active activity logs');
    const activeActivityLogs = await prisma.activityContinuityLog.findMany({
      where: whereClause,
      include: { activity: true },
    });

    const serialized = activeActivityLogs.map((log) => ({
      id: log.id,
      name: log.activity.name,
      startDate: log.startDate.toISOString(),
    }));

    log('Fetched active activity logs', { count: serialized.length });
    return NextResponse.json(serialized);
  } catch (error: unknown) {
    log('Failed to fetch active activity logs', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch active activity logs' },
      { status: 500 },
    );
  }
}
// src/app/api/activities/active/route.ts
