// src/app/api/admissions/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:ADMISSIONS] ${message}`,
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
//     const status = searchParams.get('status'); // 'active', 'discharged', or undefined

//     const baseWhereClause =
//       status === 'active'
//         ? { dischargeDate: null }
//         : status === 'discharged'
//           ? { dischargeDate: { not: null } }
//           : {};

//     // Role-based access control
//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     const whereClause: any = { ...baseWhereClause };
//     if (userRoleLevel < 3) {
//       whereClause.admittedBy = {
//         departmentId: userProfile.departmentId,
//       };
//     }

//     log('Fetching admissions', { page, pageSize, status });
//     const [admissions, total] = await Promise.all([
//       prisma.admission.findMany({
//         where: whereClause,
//         skip,
//         take: pageSize,
//         orderBy: { admissionDate: 'desc' },
//         include: {
//           serviceUser: true,
//           ward: true,
//           admittedBy: true,
//           dischargedBy: true,
//         },
//       }),
//       prisma.admission.count({ where: whereClause }),
//     ]);

//     const serialized = admissions.map((admission) => ({
//       ...admission,
//       admissionDate: admission.admissionDate.toISOString(),
//       dischargeDate: admission.dischargeDate?.toISOString() || null,
//     }));

//     log('Admissions fetched successfully', { count: admissions.length });
//     return NextResponse.json({ admissions: serialized, total, page, pageSize });
//   } catch (error) {
//     log('Failed to fetch admissions', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch admissions' },
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
//     const { serviceUserId, wardId, admissionDate } = body;
//     log('Creating admission', { serviceUserId, wardId, admissionDate });

//     if (
//       !Number.isInteger(serviceUserId) ||
//       !Number.isInteger(wardId) ||
//       !admissionDate
//     ) {
//       log('Invalid input');
//       return NextResponse.json(
//         { error: 'Service user ID, ward ID, and admission date are required' },
//         { status: 400 },
//       );
//     }

//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3) {
//       const creator = await prisma.user.findUnique({
//         where: { id: creatorId },
//         select: { departmentId: true },
//       });

//       if (!creator) {
//         log('Creator not found', { creatorId });
//         return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
//       }

//       if (creator.departmentId !== userProfile.departmentId) {
//         log('Forbidden: User cannot create admissions for other departments');
//         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//       }
//     }

//     const admission = await prisma.admission.create({
//       data: {
//         serviceUserId,
//         wardId,
//         admissionDate: new Date(admissionDate),
//         dischargeDate: null,
//         admittedById: creatorId,
//       },
//       include: { serviceUser: true, ward: true, admittedBy: true },
//     });

//     log('Admission created successfully', { id: admission.id });
//     return NextResponse.json(
//       {
//         ...admission,
//         admissionDate: admission.admissionDate.toISOString(),
//         dischargeDate: admission.dischargeDate?.toISOString() || null,
//       },
//       { status: 201 },
//     );
//   } catch (error: any) {
//     if (error.code === 'P2003') {
//       log('Invalid foreign key', { serviceUserId: body?.serviceUserId, wardId: body?.wardId });
//       return NextResponse.json(
//         { error: 'Service user or ward not found' },
//         { status: 404 },
//       );
//     }
//     log('Failed to create admission', error);
//     return NextResponse.json(
//       { error: 'Failed to create admission' },
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
    `[API:ADMISSIONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(
    req,
    4,
    undefined,
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  try {
    log('Fetching all admissions');
    const admissions = await prisma.admission.findMany({
      include: { serviceUser: true, ward: true },
    });

    log('Admissions fetched successfully', { count: admissions.length });
    return NextResponse.json(admissions);
  } catch (error: unknown) {
    log('Failed to fetch admissions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(
    req,
    4,
    undefined,
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;

  // Initialize variables to avoid undefined errors
  let serviceUserId: string | undefined = undefined;
  let wardId: number | undefined = undefined;

  try {
    const { serviceUserId: suId, wardId: wId } = await req.json();
    serviceUserId = suId;
    wardId = wId;

    log('Creating admission', { serviceUserId, wardId });

    if (!serviceUserId || !Number.isInteger(wardId)) {
      log('Invalid admission data');
      return NextResponse.json(
        { error: 'Invalid admission data' },
        { status: 400 },
      );
    }

    if (!wardId) {
      return NextResponse.json(
        { error: 'Ward ID is required' },
        { status: 400 },
      );
    }

    const admission = await prisma.admission.create({
      data: {
        serviceUserId: parseInt(serviceUserId, 10),
        wardId: wardId,
        admittedById: userId,
        admissionDate: new Date(),
      },
      include: { serviceUser: true, ward: true },
    });

    log('Admission created successfully', { id: admission.id });
    return NextResponse.json(admission, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        log('Invalid service user or ward ID', { serviceUserId, wardId });
        return NextResponse.json(
          { error: 'Service user or ward not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to create admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 },
    );
  }
}
// app/api/admissions/route.ts
