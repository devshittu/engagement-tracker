// src/app/api/admissions/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';

// type Params = { params: { id: string } };

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:ADMISSIONS/ID] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function GET(req: NextRequest, { params }: Params) {
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

//   const { id } = params;
//   const admissionId = parseInt(id);

//   if (isNaN(admissionId)) {
//     log('Invalid admission ID', { id });
//     return NextResponse.json(
//       { error: 'Invalid admission ID' },
//       { status: 400 },
//     );
//   }

//   try {
//     log('Fetching admission', { id: admissionId });
//     const admission = await prisma.admission.findUnique({
//       where: { id: admissionId },
//       include: {
//         serviceUser: true,
//         ward: true,
//         admittedBy: true,
//         dischargedBy: true,
//       },
//     });

//     if (!admission) {
//       log('Admission not found', { id: admissionId });
//       return NextResponse.json(
//         { error: 'Admission not found' },
//         { status: 404 },
//       );
//     }

//     // Role-based access control
//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && admission.admittedBy.departmentId !== userProfile.departmentId) {
//       log('Forbidden: User does not have permission to view this admission');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     log('Admission fetched successfully', { id: admission.id });
//     return NextResponse.json({
//       ...admission,
//       admissionDate: admission.admissionDate.toISOString(),
//       dischargeDate: admission.dischargeDate?.toISOString() || null,
//     });
//   } catch (error) {
//     log('Failed to fetch admission', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch admission' },
//       { status: 500 },
//     );
//   }
// }

// export async function PUT(req: NextRequest, { params }: Params) {
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
//   const { id } = params;
//   const admissionId = parseInt(id);

//   if (isNaN(admissionId)) {
//     log('Invalid admission ID', { id });
//     return NextResponse.json(
//       { error: 'Invalid admission ID' },
//       { status: 400 },
//     );
//   }

//   try {
//     const body = await req.json();
//     const { wardId, dischargeDate } = body;
//     log('Updating admission', { id: admissionId, wardId, dischargeDate });

//     const admission = await prisma.admission.findUnique({
//       where: { id: admissionId },
//       include: { admittedBy: true },
//     });

//     if (!admission) {
//       log('Admission not found', { id: admissionId });
//       return NextResponse.json(
//         { error: 'Admission not found' },
//         { status: 404 },
//       );
//     }

//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && admission.admittedBy.departmentId !== userProfile.departmentId) {
//       log('Forbidden: User does not have permission to update this admission');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const updateData: any = {};
//     if (wardId !== undefined) {
//       if (!Number.isInteger(wardId)) {
//         log('Invalid ward ID', { wardId: wardId }); // Use the value directly
//         return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
//       }
//       updateData.wardId = wardId;
//     }
//     if (dischargeDate !== undefined) {
//       updateData.dischargeDate = dischargeDate ? new Date(dischargeDate) : null;
//       updateData.dischargedById = dischargeDate ? creatorId : null;
//     }

//     const updatedAdmission = await prisma.admission.update({
//       where: { id: admissionId },
//       data: updateData,
//       include: {
//         serviceUser: true,
//         ward: true,
//         admittedBy: true,
//         dischargedBy: true,
//       },
//     });

//     log('Admission updated successfully', { id: updatedAdmission.id });
//     return NextResponse.json({
//       ...updatedAdmission,
//       admissionDate: updatedAdmission.admissionDate.toISOString(),
//       dischargeDate: updatedAdmission.dischargeDate?.toISOString() || null,
//     });
//   } catch (error: any) {
//     if (error.code === 'P2025') {
//       log('Admission not found', { id: admissionId });
//       return NextResponse.json(
//         { error: 'Admission not found' },
//         { status: 404 },
//       );
//     }
//     if (error.code === 'P2003') {
//       log('Invalid ward ID', { wardId: (await req.json()).wardId });
//       return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
//     }
//     log('Failed to update admission', error);
//     return NextResponse.json(
//       { error: 'Failed to update admission' },
//       { status: 500 },
//     );
//   }
// }

// export async function DELETE(req: NextRequest, { params }: Params) {
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

//   const { id } = params;
//   const admissionId = parseInt(id);

//   if (isNaN(admissionId)) {
//     log('Invalid admission ID', { id });
//     return NextResponse.json(
//       { error: 'Invalid admission ID' },
//       { status: 400 },
//     );
//   }

//   try {
//     const admission = await prisma.admission.findUnique({
//       where: { id: admissionId },
//       include: { admittedBy: true },
//     });

//     if (!admission) {
//       log('Admission not found', { id: admissionId });
//       return NextResponse.json(
//         { error: 'Admission not found' },
//         { status: 404 },
//       );
//     }

//     // Role-based access control
//     if (userProfile.roles.length === 0) {
//       log('User has no roles assigned');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const userRoleLevel = userProfile.roles[0].level;
//     if (userRoleLevel < 3 && admission.admittedBy.departmentId !== userProfile.departmentId) {
//       log('Forbidden: User does not have permission to delete this admission');
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     log('Deleting admission', { id: admissionId });
//     await prisma.admission.delete({
//       where: { id: admissionId },
//     });
//     log('Admission deleted successfully', { id: admissionId });
//     return NextResponse.json({ message: 'Admission deleted successfully' });
//   } catch (error: any) {
//     if (error.code === 'P2025') {
//       log('Admission not found', { id: admissionId });
//       return NextResponse.json(
//         { error: 'Admission not found' },
//         { status: 404 },
//       );
//     }
//     if (error.code === 'P2003') {
//       log('Admission has associated sessions', { id: admissionId });
//       return NextResponse.json(
//         { error: 'Cannot delete admission with associated sessions' },
//         { status: 409 },
//       );
//     }
//     log('Failed to delete admission', error);
//     return NextResponse.json(
//       { error: 'Failed to delete admission' },
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
    `[API:ADMISSIONS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json({ error: 'Invalid admission ID' }, { status: 400 });
  }

  try {
    log('Fetching admission', { id: admissionId });
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { serviceUser: true, ward: true },
    });

    if (!admission) {
      log('Admission not found', { id: admissionId });
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
    }

    log('Admission fetched successfully', { id: admission.id });
    return NextResponse.json(admission);
  } catch (error: unknown) {
    log('Failed to fetch admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json({ error: 'Invalid admission ID' }, { status: 400 });
  }

  // Initialize variables to avoid undefined errors
  let wardId: number | undefined = undefined;
  let dischargeDate: string | undefined = undefined;

  try {
    const { wardId: wId, dischargeDate: dDate } = await req.json();
    wardId = wId;
    dischargeDate = dDate;

    log('Updating admission', { id: admissionId, wardId, dischargeDate });

    if (typeof wardId === 'undefined' || !Number.isInteger(wardId)) {
      log('Invalid ward ID');
      return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
    }

    const data: { wardId: number; dischargeDate?: Date; updatedAt: Date } = {
      wardId,
      updatedAt: new Date(),
    };
    if (dischargeDate) {
      data.dischargeDate = new Date(dischargeDate);
    }

    const admission = await prisma.admission.update({
      where: { id: admissionId },
      data,
      include: { serviceUser: true, ward: true },
    });

    log('Admission updated successfully', { id: admission.id });
    return NextResponse.json(admission);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Admission not found', { id: admissionId });
        return NextResponse.json(
          { error: 'Admission not found' },
          { status: 404 },
        );
      }
      if (error.code === 'P2003') {
        log('Invalid ward ID', { wardId });
        return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
      }
    }
    log('Failed to update admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update admission' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(req, 0, 'Super Admin', (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json({ error: 'Invalid admission ID' }, { status: 400 });
  }

  try {
    log('Deleting admission', { id: admissionId });
    await prisma.admission.delete({
      where: { id: admissionId },
    });

    log('Admission deleted successfully', { id: admissionId });
    return NextResponse.json({ message: 'Admission deleted' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Admission not found', { id: admissionId });
        return NextResponse.json(
          { error: 'Admission not found' },
          { status: 404 },
        );
      }
      if (error.code === 'P2003') {
        log('Admission cannot be deleted due to associated records', { id: admissionId });
        return NextResponse.json(
          { error: 'Admission cannot be deleted due to associated records' },
          { status: 409 },
        );
      }
    }
    log('Failed to delete admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete admission' },
      { status: 500 },
    );
  }
}
// app/api/admissions/[id]/route.ts
