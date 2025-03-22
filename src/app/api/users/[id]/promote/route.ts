// src/app/api/users/[id]/promote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true, department: true },
  });

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { role: true, department: true },
  });

  if (!currentUser || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (
    currentUser.role.level <= targetUser.role.level &&
    currentUser.role.name !== 'Super Admin'
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 },
    );
  }

  if (
    currentUser.department.id !== targetUser.department.id &&
    currentUser.role.name !== 'Super Admin'
  ) {
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
    return NextResponse.json(
      { error: 'No higher role available' },
      { status: 400 },
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { roleId: nextRole.id, updatedAt: new Date() },
    include: { role: true, department: true },
  });

  return NextResponse.json(updatedUser);
}
