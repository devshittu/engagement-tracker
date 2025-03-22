// src/app/api/departments/route.ts

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

  const departments = await prisma.department.findMany();
  return NextResponse.json(departments);
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
      { error: 'Only Super Admin can create departments' },
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

  const department = await prisma.department.create({
    data: { name },
  });

  return NextResponse.json(department, { status: 201 });
}
