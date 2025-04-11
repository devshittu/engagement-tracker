// src/app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:DEPARTMENTS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  try {
    log('Fetching all departments');
    const departments = await prisma.department.findMany();

    log('Departments fetched successfully', { count: departments.length });
    return NextResponse.json(departments);
  } catch (error: unknown) {
    log('Failed to fetch departments', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(req, 0, 'Super Admin', (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  // Initialize variables to avoid undefined errors
  let name: string | undefined = undefined;

  try {
    const { name: reqName } = await req.json();
    name = reqName;

    log('Creating department', { name });

    if (!name || typeof name !== 'string') {
      log('Invalid department name');
      return NextResponse.json(
        { error: 'Invalid department name' },
        { status: 400 },
      );
    }

    const department = await prisma.department.create({
      data: { name },
    });

    log('Department created successfully', { id: department.id, name: department.name });
    return NextResponse.json(department, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        log('Department name already exists', { name });
        return NextResponse.json(
          { error: 'Department name already exists' },
          { status: 409 },
        );
      }
    }
    log('Failed to create department', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 },
    );
  }
}
// src/app/api/departments/route.ts