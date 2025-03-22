// src/app/api/roles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  const role = await prisma.role.findUnique({
    where: { id: parseInt(id) },
    include: { department: true },
  });
  if (!role)
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });

  return NextResponse.json(role);
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
    include: { role: true },
  });

  if (!currentUser || currentUser.role.name !== 'Super Admin') {
    return NextResponse.json(
      { error: 'Only Super Admin can update roles' },
      { status: 403 },
    );
  }

  const { name, level, departmentId } = await req.json();
  if (
    !name ||
    typeof name !== 'string' ||
    !Number.isInteger(level) ||
    !Number.isInteger(departmentId)
  ) {
    return NextResponse.json({ error: 'Invalid role data' }, { status: 400 });
  }

  const role = await prisma.role.update({
    where: { id: parseInt(id) },
    data: { name, level, departmentId, updatedAt: new Date() },
    include: { department: true },
  });

  return NextResponse.json(role);
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
      { error: 'Only Super Admin can delete roles' },
      { status: 403 },
    );
  }

  await prisma.role.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ message: 'Role deleted' }, { status: 200 });
}
