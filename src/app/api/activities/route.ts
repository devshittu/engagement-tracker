// src/app/api/activities/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateActivityInput } from '@/features/activities/types';

export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-supabase-user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    const userRoleLevel = user.roles?.level ?? 0;
    const userDepartmentId = user.departmentId;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20');
    const departmentId = searchParams.get('departmentId')
      ? parseInt(searchParams.get('departmentId')!)
      : undefined;

    const skip = (page - 1) * pageSize;

    let where: any = {};

    if (userRoleLevel < 3 && userDepartmentId) {
      where = {
        OR: [{ departmentId: userDepartmentId }, { departmentId: null }],
      };
    } else if (departmentId) {
      where = {
        OR: [{ departmentId }, { departmentId: null }],
      };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: { department: true },
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({ activities, total }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-supabase-user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    const userRoleLevel = user.roles?.level ?? 0;
    const userDepartmentId = user.departmentId;

    const body: CreateActivityInput = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let departmentId = body.departmentId;
    if (userRoleLevel <= 3) {
      // Restrict departmentId to user's department or null
      if (departmentId && departmentId !== userDepartmentId) {
        return NextResponse.json(
          { error: 'Unauthorized to create activity for this department' },
          { status: 403 },
        );
      }
    }

    const activity = await prisma.activity.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        departmentId: departmentId ?? null,
        createdAt: new Date(),
      },
      include: { department: true },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// src/app/api/activities/route.ts
