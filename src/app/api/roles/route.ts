// src/app/api/roles/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const user = JSON.parse(userJson);
//   const currentUser = await prisma.user.findUnique({
//     where: { id: user.id },
//     include: { role: true },
//   });

//   if (
//     !currentUser ||
//     (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')
//   ) {
//     return NextResponse.json(
//       { error: 'Insufficient permissions' },
//       { status: 403 },
//     );
//   }

//   const roles = await prisma.role.findMany({
//     include: { department: true },
//   });
//   return NextResponse.json(roles);
// }

// export async function POST(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const user = JSON.parse(userJson);
//   const currentUser = await prisma.user.findUnique({
//     where: { id: user.id },
//     include: { role: true },
//   });

//   if (!currentUser || currentUser.role.name !== 'Super Admin') {
//     return NextResponse.json(
//       { error: 'Only Super Admin can create roles' },
//       { status: 403 },
//     );
//   }

//   const { name, level, departmentId } = await req.json();
//   if (
//     !name ||
//     typeof name !== 'string' ||
//     !Number.isInteger(level) ||
//     !Number.isInteger(departmentId)
//   ) {
//     return NextResponse.json({ error: 'Invalid role data' }, { status: 400 });
//   }

//   const role = await prisma.role.create({
//     data: { name, level, departmentId },
//     include: { department: true },
//   });

//   return NextResponse.json(role, { status: 201 });
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client'; // Import Prisma for error types

const log = (message: string, data?: any) =>
  console.log(
    `[API:ROLES] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  try {
    log('Fetching all roles');
    const roles = await prisma.role.findMany({
      include: { department: true },
    });

    log('Roles fetched successfully', { count: roles.length });
    return NextResponse.json(roles);
  } catch (error: unknown) {
    log('Failed to fetch roles', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(req, 0, 'Super Admin', (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  let departmentId: number | undefined = undefined;
  try {
    const { name, level, departmentId: deptId } = await req.json();
    departmentId = deptId;
    // Step 2: Ensure departmentId is defined for logging
    log('Creating role', { name, level, departmentId: departmentId ?? 'undefined' });

    if (
      !name ||
      typeof name !== 'string' ||
      !Number.isInteger(level) ||
      !departmentId ||
      !Number.isInteger(departmentId)
    ) {
      log('Invalid role data');
      return NextResponse.json({ error: 'Invalid role data' }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        level,
        departmentId: departmentId,
      },
      include: { department: true },
    });

    log('Role created successfully', { id: role.id, name: role.name });
    return NextResponse.json(role, { status: 201 });
  } catch (error: unknown) {
    // Step 3: Fix Prisma error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        log('Role name already exists', { name });
        return NextResponse.json(
          { error: 'Role name already exists' },
          { status: 409 },
        );
      }
      if (error.code === 'P2003') {
        log('Invalid department ID', { departmentId: departmentId ?? 'undefined' });
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to create role', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 },
    );
  }
}