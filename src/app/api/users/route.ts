// src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:USERS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(
    req,
    4,
    undefined,
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  try {
    log('Fetching all users');
    const users = await prisma.user.findMany({
      include: { department: true, role: true },
    });

    log('Users fetched successfully', { count: users.length });
    return NextResponse.json(users);
  } catch (error: unknown) {
    log('Failed to fetch users', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(
    req,
    4,
    undefined,
    (message, data) => log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;

  // Initialize variables to avoid undefined errors
  let email: string | undefined = undefined;
  let departmentId: number | undefined = undefined;
  let roleId: number | undefined = undefined;

  try {
    const {
      email: reqEmail,
      departmentId: deptId,
      roleId: rId,
    } = await req.json();
    email = reqEmail;
    departmentId = deptId;
    roleId = rId;

    log('Creating user', { email, departmentId, roleId });

    if (
      !email ||
      !Number.isInteger(departmentId) ||
      !Number.isInteger(roleId)
    ) {
      log('Invalid user data');
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: 'defaultPassword123!',
        email_confirm: true,
      });
    if (authError) {
      log('Failed to create user in Supabase', { error: authError.message });
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        departmentId: departmentId as number,
        roleId: roleId as number,
        createdById: userId,
      },
      include: { department: true, role: true },
    });

    log('User created successfully', { id: newUser.id });
    return NextResponse.json(newUser, { status: 201 });
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
    log('Failed to create user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    );
  }
}
// src/app/api/users/route.ts
