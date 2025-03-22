// src/app/api/departments/[id]/route.ts

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

  const department = await prisma.department.findUnique({
    where: { id: parseInt(id) },
  });
  if (!department)
    return NextResponse.json(
      { error: 'Department not found' },
      { status: 404 },
    );

  return NextResponse.json(department);
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
      { error: 'Only Super Admin can update departments' },
      { status: 403 },
    );
  }

  const { name } = await req.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      { error: 'Invalid department name' },
      { status: 400 },
    );
  }

  const department = await prisma.department.update({
    where: { id: parseInt(id) },
    data: { name, updatedAt: new Date() },
  });

  return NextResponse.json(department);
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
      { error: 'Only Super Admin can delete departments' },
      { status: 403 },
    );
  }

  await prisma.department.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ message: 'Department deleted' }, { status: 200 });
}
