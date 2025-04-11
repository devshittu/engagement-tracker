// src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { Prisma } from '@prisma/client';

type Params = { params: Promise<{ id: string }>  };

const log = (message: string, data?: any) =>
  console.log(
    `[API:USERS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(
  req: NextRequest,
  { params }: Params,
) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    log('Fetching user', { id });
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { department: true, role: true },
    });

    if (!targetUser) {
      log('User not found', { id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    log('User fetched successfully', { id: targetUser.id });
    return NextResponse.json(targetUser);
  } catch (error: unknown) {
    log('Failed to fetch user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params,
) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4; additional checks will be manual
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile, userId } = authResult;
  const { id } = await params;

  // Initialize variables to avoid undefined errors
  let email: string | undefined = undefined;
  let departmentId: number | undefined = undefined;
  let roleId: number | undefined = undefined;

  try {
    const { email: reqEmail, departmentId: deptId, roleId: rId } = await req.json();
    email = reqEmail;
    departmentId = deptId;
    roleId = rId;

    log('Updating user', { id, email, departmentId, roleId });

    if (!email || !Number.isInteger(departmentId) || !Number.isInteger(roleId)) {
      log('Invalid user data');
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { department: true, role: true },
    });
    if (!targetUser) {
      log('User not found', { id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!newRole) {
      log('Role not found', { roleId });
      return NextResponse.json({ error: 'Role not found' }, { status: 400 });
    }

    // Step 2: Manual role level check
    const currentUserRole = userProfile.roles[0];
    if (
      currentUserRole.level <= newRole.level &&
      currentUserRole.name !== 'Super Admin' &&
      userProfile.departmentId !== targetUser.department.id
    ) {
      log('Cannot assign higher or equal role', {
        currentUserLevel: currentUserRole.level,
        newRoleLevel: newRole.level,
      });
      return NextResponse.json(
        { error: 'Cannot assign higher or equal role' },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, departmentId, roleId, updatedAt: new Date() },
      include: { department: true, role: true },
    });

    log('User updated successfully', { id: updatedUser.id });
    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        log('Email already exists', { email });
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 },
        );
      }
      if (error.code === 'P2003') {
        log('Invalid department or role ID', { departmentId, roleId });
        return NextResponse.json(
          { error: 'Department or role not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to update user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params,
) {
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(req, 0, 'Super Admin', (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    log('Deleting user', { id });
    await prisma.user.delete({ where: { id } });
    await supabase.auth.admin.deleteUser(id);

    log('User deleted successfully', { id });
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('User not found', { id });
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        log('User cannot be deleted due to associated records', { id });
        return NextResponse.json(
          { error: 'User cannot be deleted due to associated records' },
          { status: 409 },
        );
      }
    }
    log('Failed to delete user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}