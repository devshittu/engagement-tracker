// src/app/api/departments/[id]/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   const { id } = params;
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

//   const department = await prisma.department.findUnique({
//     where: { id: parseInt(id) },
//   });
//   if (!department)
//     return NextResponse.json(
//       { error: 'Department not found' },
//       { status: 404 },
//     );

//   return NextResponse.json(department);
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   const { id } = params;
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
//       { error: 'Only Super Admin can update departments' },
//       { status: 403 },
//     );
//   }

//   const { name } = await req.json();
//   if (!name || typeof name !== 'string') {
//     return NextResponse.json(
//       { error: 'Invalid department name' },
//       { status: 400 },
//     );
//   }

//   const department = await prisma.department.update({
//     where: { id: parseInt(id) },
//     data: { name, updatedAt: new Date() },
//   });

//   return NextResponse.json(department);
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   const { id } = params;
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
//       { error: 'Only Super Admin can delete departments' },
//       { status: 403 },
//     );
//   }

//   await prisma.department.delete({
//     where: { id: parseInt(id) },
//   });

//   return NextResponse.json({ message: 'Department deleted' }, { status: 200 });
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(`[API:DEPARTMENTS/ID] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authenticateRequest(req, 4, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const departmentId = parseInt(id);

  if (isNaN(departmentId)) {
    log('Invalid department ID', { id });
    return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 });
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      log('Department not found', { id: departmentId });
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    log('Department fetched successfully', { id: department.id, name: department.name });
    return NextResponse.json(department);
  } catch (error) {
    log('Failed to fetch department', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authenticateRequest(req, 0, 'Super Admin', log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const departmentId = parseInt(id);

  if (isNaN(departmentId)) {
    log('Invalid department ID', { id });
    return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      log('Invalid department name', { name });
      return NextResponse.json({ error: 'Invalid department name' }, { status: 400 });
    }

    const department = await prisma.department.update({
      where: { id: departmentId },
      data: { name: name.trim(), updatedAt: new Date() },
    });

    log('Department updated successfully', { id: department.id, name: department.name });
    return NextResponse.json(department);
  } catch (error: any) {
    if (error.code === 'P2002') {
      log('Department name already exists', { name });
      return NextResponse.json({ error: 'Department name already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      log('Department not found', { id: departmentId });
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    log('Failed to update department', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authenticateRequest(req, 0, 'Super Admin', log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const departmentId = parseInt(id);

  if (isNaN(departmentId)) {
    log('Invalid department ID', { id });
    return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 });
  }

  try {
    await prisma.department.delete({
      where: { id: departmentId },
    });

    log('Department deleted successfully', { id: departmentId });
    return NextResponse.json({ message: 'Department deleted' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Department not found', { id: departmentId });
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    if (error.code === 'P2003') {
      log('Department cannot be deleted due to associated records', { id: departmentId });
      return NextResponse.json(
        { error: 'Department cannot be deleted because it has associated records' },
        { status: 409 },
      );
    }
    log('Failed to delete department', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}