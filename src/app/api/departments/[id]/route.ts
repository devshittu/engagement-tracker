// src/app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:DEPARTMENTS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(
    req,
    4,
    undefined,
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const departmentId = parseInt(id);

  if (isNaN(departmentId)) {
    log('Invalid department ID', { id });
    return NextResponse.json(
      { error: 'Invalid department ID' },
      { status: 400 },
    );
  }

  try {
    log('Fetching department', { id: departmentId });
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      log('Department not found', { id: departmentId });
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 },
      );
    }

    log('Department fetched successfully', {
      id: department.id,
      name: department.name,
    });
    return NextResponse.json(department);
  } catch (error: unknown) {
    log('Failed to fetch department', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(
    req,
    0,
    'Super Admin',
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const departmentId = parseInt(id);

  if (isNaN(departmentId)) {
    log('Invalid department ID', { id });
    return NextResponse.json(
      { error: 'Invalid department ID' },
      { status: 400 },
    );
  }

  // Initialize variables to avoid undefined errors
  let name: string | undefined = undefined;

  try {
    const { name: reqName } = await req.json();
    name = reqName;

    log('Updating department', { id: departmentId, name });

    if (!name || typeof name !== 'string') {
      log('Invalid department name');
      return NextResponse.json(
        { error: 'Invalid department name' },
        { status: 400 },
      );
    }

    const department = await prisma.department.update({
      where: { id: departmentId },
      data: { name, updatedAt: new Date() },
    });

    log('Department updated successfully', {
      id: department.id,
      name: department.name,
    });
    return NextResponse.json(department);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Department not found', { id: departmentId });
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 },
        );
      }
      if (error.code === 'P2002') {
        log('Department name already exists', { name });
        return NextResponse.json(
          { error: 'Department name already exists' },
          { status: 409 },
        );
      }
    }
    log('Failed to update department', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(
    req,
    0,
    'Super Admin',
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const departmentId = parseInt(id);

  if (isNaN(departmentId)) {
    log('Invalid department ID', { id });
    return NextResponse.json(
      { error: 'Invalid department ID' },
      { status: 400 },
    );
  }

  try {
    log('Deleting department', { id: departmentId });
    await prisma.department.delete({
      where: { id: departmentId },
    });

    log('Department deleted successfully', { id: departmentId });
    return NextResponse.json(
      { message: 'Department deleted' },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Department not found', { id: departmentId });
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 },
        );
      }
      if (error.code === 'P2003') {
        log('Department cannot be deleted due to associated records', {
          id: departmentId,
        });
        return NextResponse.json(
          {
            error:
              'Department cannot be deleted because it has associated records',
          },
          { status: 409 },
        );
      }
    }
    log('Failed to delete department', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 },
    );
  }
}
