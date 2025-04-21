// src/app/api/roles/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client'; // Import Prisma for error types

const log = (message: string, data?: any) =>
  console.log(
    `[API:ROLES/ID] ${message}`,
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

  const roleId = parseInt(id);

  if (isNaN(roleId)) {
    log('Invalid role ID', { id });
    return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
  }

  try {
    log('Fetching role', { id: roleId });
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { department: true },
    });

    if (!role) {
      log('Role not found', { id: roleId });
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    log('Role fetched successfully', { id: role.id, name: role.name });
    return NextResponse.json(role);
  } catch (error: unknown) {
    log('Failed to fetch role', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch role' },
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

  const roleId = parseInt(id);

  if (isNaN(roleId)) {
    log('Invalid role ID', { id });
    return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
  }

  let departmentId: number | undefined;
  try {
    const { name, level, departmentId: deptId } = await req.json();
    departmentId = deptId;
    // Step 2: Ensure departmentId is defined for logging
    log('Updating role', {
      id: roleId,
      name,
      level,
      departmentId: departmentId ?? 'undefined',
    });

    if (
      !name ||
      typeof name !== 'string' ||
      !Number.isInteger(level) ||
      !Number.isInteger(departmentId)
    ) {
      log('Invalid role data');
      return NextResponse.json({ error: 'Invalid role data' }, { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: { name, level, departmentId, updatedAt: new Date() },
      include: { department: true },
    });

    log('Role updated successfully', { id: role.id, name: role.name });
    return NextResponse.json(role);
  } catch (error: unknown) {
    // Step 3: Fix Prisma error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Role not found', { id: roleId });
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        log('Invalid department ID', {
          id: roleId,
          departmentId: departmentId ?? 'undefined',
        });
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to update role', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update role' },
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

  const roleId = parseInt(id);

  if (isNaN(roleId)) {
    log('Invalid role ID', { id });
    return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
  }

  try {
    log('Deleting role', { id: roleId });
    await prisma.role.delete({
      where: { id: roleId },
    });

    log('Role deleted successfully', { id: roleId });
    return NextResponse.json({ message: 'Role deleted' }, { status: 200 });
  } catch (error: unknown) {
    // Step 2: Fix Prisma error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Role not found', { id: roleId });
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        log('Role cannot be deleted due to associated users', { id: roleId });
        return NextResponse.json(
          { error: 'Role cannot be deleted because it has associated users' },
          { status: 409 },
        );
      }
    }
    log('Failed to delete role', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 },
    );
  }
}
