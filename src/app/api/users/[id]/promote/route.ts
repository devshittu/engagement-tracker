// src/app/api/users/[id]/promote/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

type Params = { params: Promise<{ id: string }>  };

const log = (message: string, data?: any) =>
  console.log(
    `[API:USERS/ID/PROMOTE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(
  req: NextRequest,
  { params }: Params,
) {
  // Step 1: Authenticate with a minimal role level; we'll handle additional checks manually
  const authResult = await authenticateRequest(req, 0, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { userProfile, userId } = authResult;
  const { id } = await params;

  try {
    log('Fetching current user and target user', { currentUserId: userId, targetUserId: id });
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, department: true },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true, department: true },
    });

    if (!currentUser || !targetUser) {
      log('User not found', { currentUserId: userId, targetUserId: id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 2: Manual role and department checks
    const currentUserRole = userProfile.roles[0]; // From authMiddleware
    const targetUserRoleLevel = targetUser.role.level;

    if (
      currentUserRole.level <= targetUserRoleLevel &&
      currentUserRole.name !== 'Super Admin'
    ) {
      log('Insufficient permissions: Role level too low', {
        currentUserLevel: currentUserRole.level,
        targetUserLevel: targetUserRoleLevel,
      });
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    if (
      currentUser.department.id !== targetUser.department.id &&
      currentUserRole.name !== 'Super Admin'
    ) {
      log('Cannot promote across departments', {
        currentUserDept: currentUser.department.id,
        targetUserDept: targetUser.department.id,
      });
      return NextResponse.json(
        { error: 'Cannot promote across departments' },
        { status: 403 },
      );
    }

    const nextRole = await prisma.role.findFirst({
      where: {
        departmentId: targetUser.department.id,
        level: targetUser.role.level + 1,
      },
    });

    if (!nextRole) {
      log('No higher role available', { currentLevel: targetUser.role.level });
      return NextResponse.json(
        { error: 'No higher role available' },
        { status: 400 },
      );
    }

    log('Promoting user', { userId: id, newRoleId: nextRole.id });
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { roleId: nextRole.id, updatedAt: new Date() },
      include: { role: true, department: true },
    });

    log('User promoted successfully', { userId: id, newRoleId: nextRole.id });
    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    log('Failed to promote user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 },
    );
  }
}