// src/app/api/roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

  const roles = await prisma.role.findMany({
    include: { department: true },
  });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
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
      { error: 'Only Super Admin can create roles' },
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

  const role = await prisma.role.create({
    data: { name, level, departmentId },
    include: { department: true },
  });

  return NextResponse.json(role, { status: 201 });
}
