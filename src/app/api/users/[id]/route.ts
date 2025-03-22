// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET(
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
    include: { role: true },
  });

  if (
    !currentUser ||
    (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { department: true, role: true },
  });
  if (!targetUser)
    return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(targetUser);
}

export async function PUT(
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

  if (
    !currentUser ||
    (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { department: true, role: true },
  });
  if (!targetUser)
    return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { email, departmentId, roleId } = await req.json();
  if (!email || !Number.isInteger(departmentId) || !Number.isInteger(roleId)) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }

  const newRole = await prisma.role.findUnique({ where: { id: roleId } });
  if (!newRole)
    return NextResponse.json({ error: 'Role not found' }, { status: 400 });
  if (
    currentUser.role.level <= newRole.level &&
    currentUser.role.name !== 'Super Admin' &&
    currentUser.department.id !== targetUser.department.id
  ) {
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

  return NextResponse.json(updatedUser);
}

export async function DELETE(
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
    include: { role: true },
  });

  if (!currentUser || currentUser.role.name !== 'Super Admin') {
    return NextResponse.json(
      { error: 'Only Super Admin can delete users' },
      { status: 403 },
    );
  }

  await prisma.user.delete({ where: { id } });
  await supabase.auth.admin.deleteUser(id);

  return NextResponse.json({ message: 'User deleted' }, { status: 200 });
}
