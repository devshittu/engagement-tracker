// src/app/api/activities/active/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { authenticateRequest } from '@/lib/authMiddleware';

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:ACTIVITIES/ACTIVE] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function GET(req: NextRequest) {
//   // Step 1: Use authenticateRequest with requiredRoleLevel: 3
//   const authResult = await authenticateRequest(req, 3, undefined, log);
//   if (authResult instanceof NextResponse) return authResult;

//   const { userProfile } = authResult;

//   try {
//     const now = new Date();
//     const whereClause: any = {
//       startDate: { lte: now },
//       discontinuedDate: null,
//     };

//     // If user role level is less than 3, filter by their department
//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3) {
//       whereClause.activity = {
//         departmentId: userProfile.departmentId,
//       };
//     }

//     log('Fetching active activity logs');
//     const activeActivityLogs = await prisma.activityContinuityLog.findMany({
//       where: whereClause,
//       include: { activity: true },
//     });

//     const serialized = activeActivityLogs.map((log) => ({
//       id: log.id,
//       name: log.activity.name,
//       startDate: log.startDate.toISOString(),
//     }));

//     log('Fetched active activity logs', { count: serialized.length });
//     return NextResponse.json(serialized);
//   } catch (error: unknown) {
//     log('Failed to fetch active activity logs', {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return NextResponse.json(
//       { error: 'Failed to fetch active activity logs' },
//       { status: 500 },
//     );
//   }
// }

// src/app/api/activities/active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITIES/ACTIVE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 3, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile } = authResult;

  try {
    const now = new Date();
    const whereClause: any = {
      startDate: { lte: now },
      discontinuedDate: null,
    };

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
      id: log.id, // Return activity log ID
      activityId: log.activity.id, // Return activity ID, not log ID
      name: log.activity.name,
      description: log.activity.description || null,
      departmentId: log.activity.departmentId || null,
      createdAt: log.activity.createdAt.toISOString(), // Serialize activity dates
      updatedAt: log.activity.updatedAt?.toISOString() || null,
      startDate: log.startDate.toISOString(), // Keep log-specific field
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
